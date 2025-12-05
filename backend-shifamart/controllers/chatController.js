const mongoose = require('mongoose');
const ChatSession = require('../models/ChatSession');
const HealthRecord = require('../models/HealthRecord');

// @desc    Create new chat session
// @route   POST /api/chat/sessions
// @access  Private
exports.createSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { initialMessage } = req.body;

    const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sessionData = {
      userId: userId,
      sessionId: sessionId,
      status: 'active',
      startedAt: new Date()
    };

    // Add initial message if provided
    if (initialMessage) {
      sessionData.messages = [{
        sender: 'user',
        content: initialMessage,
        timestamp: new Date()
      }];
    }

    const session = new ChatSession(sessionData);
    await session.save();

    res.status(201).json({
      success: true,
      message: 'Chat session created',
      data: {
        sessionId: session.sessionId,
        startedAt: session.startedAt,
        status: session.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create session',
      error: error.message
    });
  }
};

// @desc    Get user's chat sessions
// @route   GET /api/chat/sessions
// @access  Private
exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, status } = req.query;

    // Build query
    const query = { userId };
    if (status) {
      query.status = status;
    }

    const sessions = await ChatSession.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-messages') // Exclude messages for list view
      .lean();

    const total = await ChatSession.countDocuments(query);

    // Format response
    const formattedSessions = sessions.map(session => ({
      id: session._id,
      sessionId: session.sessionId,
      symptoms: session.symptoms || [],
      status: session.status,
      severity: session.severity || {},
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      duration: session.duration,
      messageCount: session.messages ? session.messages.length : 0,
      updatedAt: session.updatedAt
    }));

    res.json({
      success: true,
      data: formattedSessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

// @desc    Get specific session with messages
// @route   GET /api/chat/sessions/:sessionId
// @access  Private
exports.getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await ChatSession.findOne({
      sessionId: sessionId,
      userId: userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Format messages
    const formattedMessages = session.messages.map(msg => ({
      id: msg._id,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.metadata || {}
    }));

    res.json({
      success: true,
      data: {
        sessionId: session.sessionId,
        symptoms: session.symptoms || [],
        predictions: session.predictions || [],
        severity: session.severity || {},
        firstAid: session.firstAid || {},
        recommendedSpecialist: session.recommendedSpecialist || {},
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        duration: session.duration,
        messages: formattedMessages,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch session',
      error: error.message
    });
  }
};

// @desc    End chat session
// @route   DELETE /api/chat/sessions/:sessionId
// @access  Private
exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await ChatSession.findOne({
      sessionId: sessionId,
      userId: userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Calculate duration
    const endedAt = new Date();
    const duration = Math.round((endedAt - session.startedAt) / (1000 * 60)); // in minutes

    // Update session
    session.status = 'completed';
    session.endedAt = endedAt;
    session.duration = duration;
    await session.save();

    res.json({
      success: true,
      message: 'Chat session ended',
      data: {
        sessionId: session.sessionId,
        status: session.status,
        endedAt: session.endedAt,
        duration: session.duration,
        messageCount: session.messages.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to end session',
      error: error.message
    });
  }
};

// @desc    Add message to session
// @route   POST /api/chat/sessions/:sessionId/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, sender, metadata } = req.body;
    const userId = req.user.id;

    // Verify session belongs to user
    const session = await ChatSession.findOne({
      sessionId: sessionId,
      userId: userId
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Add message
    session.messages.push({
      sender: sender || 'user',
      content,
      timestamp: new Date(),
      metadata: metadata || {}
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: 'Message added',
      data: {
        messageId: session.messages[session.messages.length - 1]._id,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add message',
      error: error.message
    });
  }
};

// @desc    Get session messages
// @route   GET /api/chat/sessions/:sessionId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { limit = 50, before } = req.query;

    const session = await ChatSession.findOne({
      sessionId: sessionId,
      userId: userId
    }).select('messages');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    // Sort messages by timestamp
    let messages = session.messages.sort((a, b) => a.timestamp - b.timestamp);

    // Filter messages before a certain timestamp if provided
    if (before) {
      const beforeDate = new Date(before);
      messages = messages.filter(msg => msg.timestamp < beforeDate);
    }

    // Limit messages
    messages = messages.slice(-limit);

    // Format messages
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      sender: msg.sender,
      content: msg.content,
      timestamp: msg.timestamp,
      metadata: msg.metadata || {}
    }));

    res.json({
      success: true,
      data: formattedMessages,
      metadata: {
        totalMessages: session.messages.length,
        returnedMessages: formattedMessages.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// @desc    Create health record from chat session
// @route   POST /api/chat/records
// @access  Private
exports.createHealthRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, symptoms, predictedDiseases, severityAssessment, notes } = req.body;

    // Verify session exists and belongs to user
    if (sessionId) {
      const session = await ChatSession.findOne({
        sessionId: sessionId,
        userId: userId
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }
    }

    // Create health record
    const healthRecord = new HealthRecord({
      userId: userId,
      sessionId: sessionId,
      symptoms: symptoms || [],
      predictedDiseases: predictedDiseases || [],
      severityAssessment: severityAssessment || {},
      notes: notes
    });

    await healthRecord.save();

    res.status(201).json({
      success: true,
      message: 'Health record created',
      data: {
        recordId: healthRecord._id,
        createdAt: healthRecord.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create health record',
      error: error.message
    });
  }
};

// @desc    Get user's health records
// @route   GET /api/chat/records
// @access  Private
exports.getHealthRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    // Build query
    const query = { userId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const records = await HealthRecord.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await HealthRecord.countDocuments(query);

    // Format response
    const formattedRecords = records.map(record => ({
      id: record._id,
      sessionId: record.sessionId,
      symptoms: record.symptoms || [],
      severity: record.severityAssessment || {},
      actualDiagnosis: record.actualDiagnosis || {},
      followUp: record.followUp || {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));

    res.json({
      success: true,
      data: formattedRecords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health records',
      error: error.message
    });
  }
};

// @desc    Get specific health record
// @route   GET /api/chat/records/:recordId
// @access  Private
exports.getHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;

    const record = await HealthRecord.findOne({
      _id: recordId,
      userId: userId
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health record',
      error: error.message
    });
  }
};

// @desc    Update health record
// @route   PUT /api/chat/records/:recordId
// @access  Private
exports.updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find and update record
    const record = await HealthRecord.findOneAndUpdate(
      { _id: recordId, userId: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Health record not found'
      });
    }

    res.json({
      success: true,
      message: 'Health record updated',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update health record',
      error: error.message
    });
  }
};

// @desc    Get chat summary analytics
// @route   GET /api/chat/analytics/summary
// @access  Private
exports.getChatSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts
    const totalSessions = await ChatSession.countDocuments({ userId });
    const activeSessions = await ChatSession.countDocuments({ userId, status: 'active' });
    const completedSessions = await ChatSession.countDocuments({ userId, status: 'completed' });
    
    // Get health records count
    const totalRecords = await HealthRecord.countDocuments({ userId });

    // Get common symptoms
    const sessionsWithSymptoms = await ChatSession.find({ 
      userId, 
      symptoms: { $exists: true, $ne: [] } 
    });
    
    const symptomFrequency = {};
    sessionsWithSymptoms.forEach(session => {
      session.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    });

    const commonSymptoms = Object.entries(symptomFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([symptom, count]) => ({ symptom, count }));

    res.json({
      success: true,
      data: {
        summary: {
          totalSessions,
          activeSessions,
          completedSessions,
          totalRecords
        },
        commonSymptoms,
        recentActivity: {
          lastSession: sessionsWithSymptoms[0]?.updatedAt || null,
          sessionCountLast30Days: await ChatSession.countDocuments({
            userId,
            updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          })
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
};

// @desc    Get health trends
// @route   GET /api/chat/analytics/health-trends
// @access  Private
exports.getHealthTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { days = 30 } = req.query;

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Get sessions grouped by date - FIXED: Use string for ObjectId
    const sessionsByDate = await ChatSession.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 },
          averageSeverity: { $avg: "$severity.score" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        trends: sessionsByDate,
        timeframe: {
          startDate,
          endDate: new Date(),
          days: parseInt(days)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get health trends',
      error: error.message
    });
  }
};