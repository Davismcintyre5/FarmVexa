const Chat = require('../../models/farm/Chat');
const aiService = require('../../services/aiService');
const limitService = require('../../services/limitService');
const { successResponse, errorResponse } = require('../../utils/response');
const asyncHandler = require('../../utils/asyncHandler');

const startChat = asyncHandler(async (req, res) => {
    const { message, title } = req.body;

    if (!message) {
        return errorResponse(res, 'Message is required', 400);
    }

   const limitCheck = await limitService.checkLimit(req.user.id);
if (!limitCheck.allowed) {
    return errorResponse(res, `Daily limit reached. Resets at midnight.`, 429);
}

    const aiResult = await aiService.farmerChat(message);
    await limitService.logUsage(req.user.id, 'chat', aiResult.success);

    const chat = await Chat.create({
        user: req.user.id,
        title: title || message.substring(0, 50),
        messages: [
            { role: 'user', content: message },
            { role: 'assistant', content: aiResult.data?.reply || aiResult.data || 'No response' },
        ],
        lastMessageAt: new Date(),
    });

    return successResponse(res, { chat }, 'Chat created', 201);
});

const sendMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const chatId = req.params.id;

    if (!message) {
        return errorResponse(res, 'Message is required', 400);
    }

    const limitCheck = await limitService.checkLimit(req.user.id);
    if (!limitCheck.allowed) {
        return errorResponse(res, limitCheck.reason, 429);
    }

    const chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
        return errorResponse(res, 'Chat not found', 404);
    }

    const history = chat.messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
    }));

    chat.messages.push({ role: 'user', content: message });
    await chat.save();

    const aiResult = await aiService.farmerChat(message, history);
    await limitService.logUsage(req.user.id, 'chat', aiResult.success);

    chat.messages.push({
        role: 'assistant',
        content: aiResult.data?.reply || aiResult.data || 'No response',
    });
    chat.lastMessageAt = new Date();
    await chat.save();

    return successResponse(res, { chat });
});

const getMyChats = asyncHandler(async (req, res) => {
    const chats = await Chat.find({ user: req.user.id, isActive: true })
        .select('title lastMessageAt createdAt')
        .sort({ lastMessageAt: -1 });

    return successResponse(res, { chats });
});

const getChatById = asyncHandler(async (req, res) => {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user.id });
    if (!chat) {
        return errorResponse(res, 'Chat not found', 404);
    }
    return successResponse(res, { chat });
});

const updateChatTitle = asyncHandler(async (req, res) => {
    const chat = await Chat.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { title: req.body.title },
        { new: true }
    );
    if (!chat) {
        return errorResponse(res, 'Chat not found', 404);
    }
    return successResponse(res, { chat }, 'Title updated');
});

const deleteChat = asyncHandler(async (req, res) => {
    const chat = await Chat.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        { isActive: false },
        { new: true }
    );
    if (!chat) {
        return errorResponse(res, 'Chat not found', 404);
    }
    return successResponse(res, null, 'Chat deleted');
});

const clearAllChats = asyncHandler(async (req, res) => {
    await Chat.updateMany(
        { user: req.user.id },
        { isActive: false }
    );
    return successResponse(res, null, 'All chats cleared');
});

module.exports = {
    startChat,
    sendMessage,
    getMyChats,
    getChatById,
    updateChatTitle,
    deleteChat,
    clearAllChats,
};