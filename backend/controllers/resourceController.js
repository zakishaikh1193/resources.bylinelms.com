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
    
    let query, queryParams;
    
    // For school users, restrict to permitted subject-grade combinations
    if (req.user?.role === 'school') {
      query = `SELECT r.* FROM resources r
               JOIN school_subject_permissions p ON p.school_id = ? AND p.subject_id = r.subject_id AND p.grade_id = r.grade_id
               WHERE r.status = ?`;
      queryParams = [req.user.user_id, status];
    } else {
      query = `SELECT * FROM resources WHERE status = ?`;
      queryParams = [status];
    }
    
    const [resources] = await pool.execute(query, queryParams);
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
    let countQuery, countParams;
    
    if (req.user?.role === 'school') {
      countQuery = `SELECT COUNT(*) as total FROM resources r
                    JOIN school_subject_permissions p ON p.school_id = ? AND p.subject_id = r.subject_id AND p.grade_id = r.grade_id
                    WHERE r.status = ?`;
      countParams = [req.user.user_id, status];
    } else {
      countQuery = `SELECT COUNT(*) as total FROM resources WHERE status = ?`;
      countParams = [status];
    }
    
    const [countResult] = await pool.execute(countQuery, countParams);

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
       ORDER BY r.display_order ASC, r.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitValue, offsetValue]
    );

    // Debug: Log preview image paths for each resource
    console.log('=== RESOURCE PREVIEW IMAGES DEBUG ===');
    resources.forEach((resource, index) => {
      console.log(`Resource ${index + 1}:`, {
        id: resource.resource_id,
        title: resource.title,
        preview_image: resource.preview_image,
        file_name: resource.file_name,
        file_path: resource.file_path
      });
    });
    console.log('=== END PREVIEW IMAGES DEBUG ===');

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

    // For school users, check if they have permission to access this resource
    if (req.user?.role === 'school') {
      const [permissions] = await pool.execute(
        'SELECT 1 FROM school_subject_permissions WHERE school_id = ? AND subject_id = ? AND grade_id = ?',
        [req.user.user_id, resource.subject_id, resource.grade_id]
      );

      if (permissions.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to view this resource'
        });
      }
    }

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
    
    // Check for token in query parameters (for admin downloads from activity log)
    if (req.query.token && !req.user) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024_byline_learning_solutions');
        
        // Get user details
        const [users] = await pool.execute(
          'SELECT user_id, name, email, role FROM users WHERE user_id = ?',
          [decoded.user_id]
        );
        
        if (users.length > 0) {
          req.user = users[0];
          console.log('✅ Admin authenticated via query token for download:', req.user.email);
        }
      } catch (tokenError) {
        console.log('❌ Invalid token in query parameter:', tokenError.message);
        // Continue without authentication (anonymous download)
      }
    }

    // Get resource with subject and grade info for permission check
    const [resources] = await pool.execute(
      'SELECT file_path, file_name, title, subject_id, grade_id FROM resources WHERE resource_id = ?',
      [id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resource = resources[0];

    // For school users, check if they have permission to download this resource
    if (req.user?.role === 'school') {
      const [permissions] = await pool.execute(
        'SELECT 1 FROM school_subject_permissions WHERE school_id = ? AND subject_id = ? AND grade_id = ?',
        [req.user.user_id, resource.subject_id, resource.grade_id]
      );

      if (permissions.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You do not have permission to download this resource'
        });
      }
    }

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

    // Log activity to activity_logs table
    await pool.execute(
      'INSERT INTO activity_logs (user_id, action, resource_id, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.user?.user_id || null, 'RESOURCE_DOWNLOADED', id, JSON.stringify({ title: resource.title }), req.ip]
    );

    // If it's a school user, also log to school_activity_logs table
    if (req.user && req.user.role === 'school') {
      try {
        // Get school details
        const [schoolDetails] = await pool.execute(
          'SELECT name, email, organization FROM users WHERE user_id = ?',
          [req.user.user_id]
        );

        if (schoolDetails.length > 0) {
          const school = schoolDetails[0];
          
          // Get complete resource details for logging including subject and grade
          const [resourceDetails] = await pool.execute(`
            SELECT 
              r.title, 
              r.file_name,
              r.file_size, 
              r.file_extension,
              rt.type_name as resource_type,
              s.subject_name,
              g.grade_level
            FROM resources r
            LEFT JOIN resource_types rt ON r.type_id = rt.type_id
            LEFT JOIN subjects s ON r.subject_id = s.subject_id
            LEFT JOIN grades g ON r.grade_id = g.grade_id
            WHERE r.resource_id = ?
          `, [id]);

          if (resourceDetails.length > 0) {
            const resource = resourceDetails[0];
            
            // Create additional details JSON with comprehensive information
            const additionalDetails = {
              subject: resource.subject_name || 'Not specified',
              grade: resource.grade_level || 'Not specified',
              resource_type: resource.resource_type || resource.file_extension,
              file_size: resource.file_size,
              file_extension: resource.file_extension,
              download_timestamp: new Date().toISOString(),
              user_role: 'school',
              organization: school.organization
            };
            
            await pool.execute(
              `INSERT INTO school_activity_logs (
                school_name, school_email, school_organization, 
                activity_type, resource_name, downloaded_file_name, file_name, resource_type, 
                subject_name, grade_level, ip_address, user_agent, 
                file_size, file_extension
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                school.name,
                school.email,
                school.organization,
                'resource_download',
                resource.title,
                resource.title, // downloaded_file_name - same as resource title for now
                resource.file_name, // file_name - the actual file name
                resource.resource_type || resource.file_extension,
                resource.subject_name || 'Not specified',
                resource.grade_level || 'Not specified',
                req.ip,
                req.get('User-Agent'),
                resource.file_size,
                resource.file_extension
              ]
            );
            console.log(`School download logged to school_activity_logs: ${school.name} downloaded ${resource.title} (${resource.subject_name} - ${resource.grade_level})`);
          }
        }
      } catch (logError) {
        console.error('Failed to log school download to school_activity_logs:', logError.message);
        // Don't fail the download if logging fails
      }
    }

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
       ORDER BY r.display_order ASC, r.created_at DESC
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

// Reorder resources within a grade
const reorderResources = async (req, res) => {
  try {
    console.log('Reorder request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('gradeId:', req.body.gradeId, 'type:', typeof req.body.gradeId);
    console.log('resourceIds:', req.body.resourceIds, 'type:', typeof req.body.resourceIds);
    
    const { gradeId, resourceIds } = req.body;
    
    if (!gradeId || !resourceIds || !Array.isArray(resourceIds)) {
      console.log('Validation failed:', { gradeId, resourceIds, isArray: Array.isArray(resourceIds) });
      return res.status(400).json({
        success: false,
        message: 'Grade ID and resource IDs array are required'
      });
    }

    // Start transaction
    await pool.query('START TRANSACTION');

    try {
      // Update display_order for each resource
      for (let i = 0; i < resourceIds.length; i++) {
        await pool.execute(
          'UPDATE resources SET display_order = ? WHERE resource_id = ? AND grade_id = ?',
          [i + 1, resourceIds[i], gradeId]
        );
      }

      // Commit transaction
      await pool.query('COMMIT');

      res.json({
        success: true,
        message: 'Resources reordered successfully'
      });
    } catch (error) {
      // Rollback on error
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Reorder resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reorder resources'
    });
  }
};

// Track resource view
const trackResourceView = async (req, res) => {
  try {
    const { id } = req.params; // Changed from resource_id to id to match route
    const resource_id = id; // Use id as resource_id
    const user_id = req.user?.user_id || null;
    const ip_address = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';
    const user_agent = req.headers['user-agent'] || 'Unknown';

    console.log('🔍 [DEBUG] Tracking resource view:', {
      resource_id,
      user_id,
      ip_address,
      user_agent,
      params: req.params,
      body: req.body
    });

    // Validate resource_id
    if (!resource_id || isNaN(resource_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource ID'
      });
    }

    // Get resource title for activity log
    const [resources] = await pool.execute(
      'SELECT title FROM resources WHERE resource_id = ?',
      [resource_id]
    );

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    const resource = resources[0];

    // Insert into resource_views table for detailed tracking
    await pool.execute(
      'INSERT INTO resource_views (resource_id, user_id, ip_address, user_agent) VALUES (?, ?, ?, ?)',
      [resource_id, user_id, ip_address, user_agent]
    );

    // Update view count in resources table
    await pool.execute(
      'UPDATE resources SET view_count = view_count + 1 WHERE resource_id = ?',
      [resource_id]
    );

    // Insert into activity_logs table
    const [result] = await pool.execute(
      `INSERT INTO activity_logs (user_id, action, resource_id, ip_address, user_agent, details, created_at) 
       VALUES (?, 'RESOURCE_VIEW', ?, ?, ?, ?, NOW())`,
      [user_id, resource_id, ip_address, user_agent, JSON.stringify({ title: resource.title, view_method: 'web' })]
    );

    console.log('✅ [SUCCESS] Resource view tracked:', result.insertId);

    res.json({
      success: true,
      message: 'Resource view tracked successfully',
      view_id: result.insertId
    });

  } catch (error) {
    console.error('❌ [ERROR] Track resource view error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track resource view',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove latest view log for a resource (when download occurs in same session)
const removeLatestViewLog = async (req, res) => {
  try {
    const { id } = req.params;
    const resource_id = id;
    const user_id = req.user?.user_id || null;

    console.log('🔍 [DEBUG] Removing latest view log:', {
      resource_id,
      user_id
    });

    // Validate resource_id
    if (!resource_id || isNaN(resource_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource ID'
      });
    }

    // Find and delete the most recent RESOURCE_VIEW log for this user and resource
    const [deleteResult] = await pool.execute(
      `DELETE FROM activity_logs 
       WHERE user_id = ? AND resource_id = ? AND action = 'RESOURCE_VIEW' 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [user_id, resource_id]
    );

    if (deleteResult.affectedRows > 0) {
      // Also decrement the view count in resources table
      await pool.execute(
        'UPDATE resources SET view_count = GREATEST(view_count - 1, 0) WHERE resource_id = ?',
        [resource_id]
      );

      console.log('✅ [SUCCESS] Latest view log removed:', deleteResult.affectedRows, 'rows affected');
      
      res.json({
        success: true,
        message: 'Latest view log removed successfully',
        removed_count: deleteResult.affectedRows
      });
    } else {
      console.log('ℹ️ [INFO] No view log found to remove for resource:', resource_id);
      
      res.json({
        success: true,
        message: 'No view log found to remove',
        removed_count: 0
      });
    }

  } catch (error) {
    console.error('❌ [ERROR] Remove latest view log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove latest view log',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
  reorderResources,
  debugUploadConfig,
  trackResourceView,
  removeLatestViewLog
};
