const { pool } = require('../config/database');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create new resource
const createResource = async (req, res) => {
  try {
    console.log('=== Resource Creation Started ===');
    console.log('Request body:', req.body);
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    
    const { title, description, subject_id, grade_id, type_id, tags, status = 'draft' } = req.body;
    
    // Check for main file
    if (!req.files || !req.files.file || !req.files.file[0]) {
      console.log('File validation failed - no file uploaded');
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const mainFile = req.files.file[0];
    const filePath = mainFile.path;
    const fileName = mainFile.originalname;
    const fileSize = mainFile.size;
    const fileExtension = path.extname(fileName).substring(1);

    console.log('File details:', {
      originalName: fileName,
      path: filePath,
      size: fileSize,
      extension: fileExtension
    });

    // Handle preview image
    let previewImagePath = null;
    if (req.files.preview_image && req.files.preview_image[0]) {
      previewImagePath = req.files.preview_image[0].path;
      console.log('Preview image path:', previewImagePath);
    }

    console.log('About to insert resource into database...');
    console.log('Insert parameters:', {
      title, description, type_id, subject_id, grade_id, 
      created_by: req.user.user_id, filePath, fileName, fileSize, 
      fileExtension, previewImagePath, status
    });

    // Insert resource
    const [result] = await pool.execute(
      `INSERT INTO resources (title, description, type_id, subject_id, grade_id, created_by, 
       file_path, file_name, file_size, file_extension, preview_image, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, type_id, subject_id, grade_id, req.user.user_id, 
       filePath, fileName, fileSize, fileExtension, previewImagePath, status]
    );

    const resourceId = result.insertId;

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await pool.execute(
          'INSERT INTO resource_tag_relations (resource_id, tag_id) VALUES (?, ?)',
          [resourceId, tagId]
        );
      }
    }

    // Get created resource with details
    const [resources] = await pool.execute(
      `SELECT r.*, rt.type_name, s.subject_name, g.grade_level, u.name as author_name 
       FROM resources r
       JOIN resource_types rt ON r.type_id = rt.type_id
       JOIN subjects s ON r.subject_id = s.subject_id
       JOIN grades g ON r.grade_id = g.grade_id
       JOIN users u ON r.created_by = u.user_id
       WHERE r.resource_id = ?`,
      [resourceId]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'RESOURCE_CREATED', resourceId, JSON.stringify({ title, type: status }), req.ip]
    );

    console.log(`Resource created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: resources[0]
    });
  } catch (error) {
    console.error('Create resource error:', error);
    
    // Enhanced error logging for debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });

    // Provide detailed error response based on error type
    let errorMessage = 'Failed to create resource';
    let statusCode = 500;

    if (error.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = 'Database table does not exist';
      statusCode = 500;
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = 'Database access denied';
      statusCode = 500;
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Database connection refused';
      statusCode = 500;
    } else if (error.code === 'ENOENT') {
      errorMessage = 'Upload directory not found or not accessible';
      statusCode = 500;
    } else if (error.code === 'EACCES') {
      errorMessage = 'Permission denied for upload directory';
      statusCode = 500;
    } else if (error.sqlMessage) {
      errorMessage = `Database error: ${error.sqlMessage}`;
      statusCode = 500;
    } else if (error.message) {
      errorMessage = error.message;
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        code: error.code,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      } : undefined
    });
  }
};

// Debug endpoint to check upload configuration
const debugUploadConfig = async (req, res) => {
  try {
    const uploadDir = process.env.UPLOAD_PATH || './uploads';
    const currentDir = process.cwd();
    const absoluteUploadPath = path.resolve(uploadDir);
    
    const config = {
      uploadDir,
      currentDir,
      absoluteUploadPath,
      uploadDirExists: fsSync.existsSync(uploadDir),
      absolutePathExists: fsSync.existsSync(absoluteUploadPath),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        UPLOAD_PATH: process.env.UPLOAD_PATH
      }
    };

    // Test write permissions
    try {
      const testFile = path.join(uploadDir, 'test-write-permission.tmp');
      fsSync.writeFileSync(testFile, 'test');
      fsSync.unlinkSync(testFile);
      config.writable = true;
    } catch (error) {
      config.writable = false;
      config.writeError = error.message;
    }

    res.json({
      success: true,
      message: 'Upload configuration debug info',
      data: config
    });
  } catch (error) {
    console.error('Debug upload config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get debug info',
      error: error.message
    });
  }
};

// Get all resources with filters and pagination
const getResources = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject_id,
      grade_id,
      type_id,
      status = 'published',
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (subject_id) {
      conditions.push('r.subject_id = ?');
      params.push(parseInt(subject_id));
    }

    if (grade_id) {
      conditions.push('r.grade_id = ?');
      params.push(parseInt(grade_id));
    }

    if (type_id) {
      conditions.push('r.type_id = ?');
      params.push(parseInt(type_id));
    }

    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push('(r.title LIKE ? OR r.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Debug logging
    console.log('SQL Query Parameters:', {
      params,
      limit: parseInt(limit),
      offset: parseInt(offset),
      limitType: typeof parseInt(limit),
      offsetType: typeof parseInt(offset)
    });

    // Test with simplest possible query first
    console.log('Executing query with status:', status);
    const [resources] = await pool.execute(
      `SELECT * FROM resources WHERE status = ?`,
      [status]
    );
    console.log('Query executed successfully, found resources:', resources.length);

    // If no resources found, return empty result
    if (resources.length === 0) {
      return res.json({
        success: true,
        data: {
          resources: [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 0,
            pages: 0
          }
        }
      });
    }

    // Get tags for each resource and remove counts
    const resourcesWithTags = await Promise.all(
      resources.map(async (resource) => {
        const [tags] = await pool.execute(
          `SELECT t.tag_id, t.tag_name 
           FROM resource_tag_relations rtr
           JOIN resource_tags t ON rtr.tag_id = t.tag_id
           WHERE rtr.resource_id = ?`,
          [resource.resource_id]
        );
        
        // Remove download_count and view_count, keep other fields
        const { download_count, view_count, ...resourceWithoutCounts } = resource;
        
        return {
          ...resourceWithoutCounts,
          tags: tags
        };
      })
    );

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM resources WHERE status = ?`,
      [status]
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        resources: resourcesWithTags,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resources'
    });
  }
};

const getAllResources = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      subject_id,
      grade_id,
      type_id,
      status,
      search,
      sort = 'created_at',
      order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const params = [];

    // Build WHERE conditions
    if (subject_id) {
      conditions.push('r.subject_id = ?');
      params.push(parseInt(subject_id));
    }

    if (grade_id) {
      conditions.push('r.grade_id = ?');
      params.push(parseInt(grade_id));
    }

    if (type_id) {
      conditions.push('r.type_id = ?');
      params.push(parseInt(type_id));
    }

    // Only filter by status if explicitly provided, otherwise show all
    if (status && status !== 'all') {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push(`(r.title LIKE ? OR r.description LIKE ? OR 
        EXISTS (
          SELECT 1 FROM resource_tag_relations rtr 
          JOIN resource_tags t ON rtr.tag_id = t.tag_id 
          WHERE rtr.resource_id = r.resource_id AND t.tag_name LIKE ?
        ))`);
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Debug logging
    console.log('getAllResources - Query params:', {
      params,
      limit: parseInt(limit),
      offset: parseInt(offset),
      whereClause
    });

    // Get all resources with proper JOINs for admin dashboard
    const limitValue = parseInt(limit);
    const offsetValue = parseInt(offset);
    
    console.log('getAllResources - Final params:', { limitValue, offsetValue, type: typeof limitValue });
    
    const [resources] = await pool.query(
      `SELECT r.*, 
       rt.type_name, 
       rt.icon,
       s.subject_name, 
       s.color as subject_color,
       g.grade_level, 
       u.name as author_name,
       u.organization as author_organization
       FROM resources r
       JOIN resource_types rt ON r.type_id = rt.type_id
       JOIN subjects s ON r.subject_id = s.subject_id
       JOIN grades g ON r.grade_id = g.grade_id
       JOIN users u ON r.created_by = u.user_id
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitValue, offsetValue]
    );

    // Get tags for each resource
    const resourcesWithTags = await Promise.all(
      resources.map(async (resource) => {
        const [tags] = await pool.execute(
          `SELECT t.tag_id, t.tag_name 
           FROM resource_tag_relations rtr
           JOIN resource_tags t ON rtr.tag_id = t.tag_id
           WHERE rtr.resource_id = ?`,
          [resource.resource_id]
        );
        return {
          ...resource,
          tags: tags
        };
      })
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM resources r ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Resources already have joined data, no need to add defaults
    const processedResources = resourcesWithTags;

    res.json({
      success: true,
      data: {
        resources: processedResources,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resources'
    });
  }
};

// Get single resource by ID
const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get resource with details
    const [resources] = await pool.execute(
      `SELECT r.*, rt.type_name, rt.icon, s.subject_name, s.color as subject_color, 
       g.grade_level, u.name as author_name, u.organization as author_organization
       FROM resources r
       JOIN resource_types rt ON r.type_id = rt.type_id
       JOIN subjects s ON r.subject_id = s.subject_id
       JOIN grades g ON r.grade_id = g.grade_id
       JOIN users u ON r.created_by = u.user_id
       WHERE r.resource_id = ?`,
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resource = resources[0];

    // Get tags
    const [tags] = await pool.execute(
      `SELECT rt.tag_id, rt.tag_name, rt.color
       FROM resource_tags rt
       JOIN resource_tag_relations rtr ON rt.tag_id = rtr.tag_id
       WHERE rtr.resource_id = ?`,
      [id]
    );

    // Get comments
    const [comments] = await pool.execute(
      `SELECT rc.*, u.name as user_name, u.organization
       FROM resource_comments rc
       JOIN users u ON rc.user_id = u.user_id
       WHERE rc.resource_id = ? AND rc.status = 'active'
       ORDER BY rc.created_at DESC`,
      [id]
    );

    // Record view (for both authenticated and anonymous users)
    await pool.execute(
      'INSERT INTO resource_views (resource_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [id, req.user?.user_id || null, req.ip, req.get('User-Agent')]
    );

    // Update view count
    await pool.execute(
      'UPDATE resources SET view_count = view_count + 1 WHERE resource_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...resource,
        tags,
        comments
      }
    });
  } catch (error) {
    console.error('Get resource by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resource'
    });
  }
};

// Update resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type_id, subject_id, grade_id, status, tags } = req.body;

    // Check if resource exists and user has permission
    const [resources] = await pool.execute(
      'SELECT created_by, file_path, preview_image FROM resources WHERE resource_id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resources[0].created_by !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own resources'
      });
    }

    const currentResource = resources[0];

    // Handle file uploads if present
    let newFilePath = currentResource.file_path;
    let newFileName = null;
    let newFileSize = null;
    let newFileExtension = null;
    let newPreviewImagePath = currentResource.preview_image;

    // Handle main file upload
    if (req.files && req.files.file && req.files.file[0]) {
      const mainFile = req.files.file[0];
      newFilePath = mainFile.path;
      newFileName = mainFile.originalname;
      newFileSize = mainFile.size;
      newFileExtension = path.extname(newFileName).substring(1);
    }

    // Handle preview image upload
    if (req.files && req.files.preview_image && req.files.preview_image[0]) {
      newPreviewImagePath = req.files.preview_image[0].path;
    }

    // Update resource
    const updateFields = [];
    const updateParams = [];

    if (title) {
      updateFields.push('title = ?');
      updateParams.push(title);
    }

    if (description !== undefined) {
      updateFields.push('description = ?');
      updateParams.push(description);
    }

    if (type_id) {
      updateFields.push('type_id = ?');
      updateParams.push(type_id);
    }

    if (subject_id) {
      updateFields.push('subject_id = ?');
      updateParams.push(subject_id);
    }

    if (grade_id) {
      updateFields.push('grade_id = ?');
      updateParams.push(grade_id);
    }

    if (status) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    // Add file-related fields if files were uploaded
    if (newFileName) {
      updateFields.push('file_path = ?, file_name = ?, file_size = ?, file_extension = ?');
      updateParams.push(newFilePath, newFileName, newFileSize, newFileExtension);
    }

    if (newPreviewImagePath !== currentResource.preview_image) {
      updateFields.push('preview_image = ?');
      updateParams.push(newPreviewImagePath);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateParams.push(id);

      await pool.execute(
        `UPDATE resources SET ${updateFields.join(', ')} WHERE resource_id = ?`,
        updateParams
      );
    }

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      // Remove existing tags
      await pool.execute('DELETE FROM resource_tag_relations WHERE resource_id = ?', [id]);

      // Add new tags
      for (const tagId of tags) {
        await pool.execute(
          'INSERT INTO resource_tag_relations (resource_id, tag_id) VALUES (?, ?)',
          [id, tagId]
        );
      }
    }

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'RESOURCE_UPDATED', id, JSON.stringify({ updatedFields: req.body }), req.ip]
    );

    console.log(`Resource updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Resource updated successfully'
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resource'
    });
  }
};

// Delete resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resource exists and user has permission
    const [resources] = await pool.execute(
      'SELECT created_by, file_path FROM resources WHERE resource_id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resources[0].created_by !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own resources'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resources[0].file_path);
    } catch (fileError) {
      console.warn(`File not found for deletion: ${resources[0].file_path}`);
    }

    // Delete resource (cascade will handle related records)
    await pool.execute('DELETE FROM resources WHERE resource_id = ?', [id]);

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)',
      [req.user.user_id, 'RESOURCE_DELETED', JSON.stringify({ resourceId: id }), req.ip]
    );

    console.log(`Resource deleted: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource'
    });
  }
};

// Download resource
const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;

    // Get resource
    const [resources] = await pool.execute(
      'SELECT file_path, file_name, title FROM resources WHERE resource_id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resource = resources[0];

    // Check if file exists
    try {
      await fs.access(resource.file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Record download (for both authenticated and anonymous users)
    await pool.execute(
      'INSERT INTO resource_downloads (resource_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [id, req.user?.user_id || null, req.ip, req.get('User-Agent')]
    );

    // Update download count
    await pool.execute(
      'UPDATE resources SET download_count = download_count + 1 WHERE resource_id = ?',
      [id]
    );

    // Log activity
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.user?.user_id || null, 'RESOURCE_DOWNLOADED', id, JSON.stringify({ title: resource.title }), req.ip]
    );

    // Send file
    res.download(resource.file_path, resource.file_name);
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download resource'
    });
  }
};

// Like/Unlike resource
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if resource exists
    const [resources] = await pool.execute(
      'SELECT resource_id FROM resources WHERE resource_id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check if user already liked
    const [likes] = await pool.execute(
      'SELECT * FROM resource_likes WHERE resource_id = ? AND user_id = ?',
      [id, req.user.user_id]
    );

    if (likes.length > 0) {
      // Unlike
      await pool.execute(
        'DELETE FROM resource_likes WHERE resource_id = ? AND user_id = ?',
        [id, req.user.user_id]
      );

      await pool.execute(
        'UPDATE resources SET likes = likes - 1 WHERE resource_id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Resource unliked',
        liked: false
      });
    } else {
      // Like
      await pool.execute(
        'INSERT INTO resource_likes (resource_id, user_id) VALUES (?, ?)',
        [id, req.user.user_id]
      );

      await pool.execute(
        'UPDATE resources SET likes = likes + 1 WHERE resource_id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Resource liked',
        liked: true
      });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
};

// Get popular resources
const getPopularResources = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [resources] = await pool.execute(
      `SELECT r.*, rt.type_name, s.subject_name, g.grade_level, u.name as author_name
       FROM resources r
       JOIN resource_types rt ON r.type_id = rt.type_id
       JOIN subjects s ON r.subject_id = s.subject_id
       JOIN grades g ON r.grade_id = g.grade_id
       JOIN users u ON r.created_by = u.user_id
       WHERE r.status = 'published'
       ORDER BY (r.download_count + r.view_count + r.likes) DESC
       LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Get popular resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popular resources'
    });
  }
};

// Get user's resources
const getUserResources = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const [resources] = await pool.execute(
      `SELECT r.*, rt.type_name, s.subject_name, g.grade_level
       FROM resources r
       JOIN resource_types rt ON r.type_id = rt.type_id
       JOIN subjects s ON r.subject_id = s.subject_id
       JOIN grades g ON r.grade_id = g.grade_id
       WHERE r.created_by = ?
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.user_id, parseInt(limit), offset]
    );

    // Get total count
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM resources WHERE created_by = ?',
      [req.user.user_id]
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user resources'
    });
  }
};

module.exports = {
  createResource,
  getResources,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  downloadResource,
  toggleLike,
  getPopularResources,
  getUserResources,
  debugUploadConfig
};
