const handleSendMessage = async () => {
  if (!inputText.trim() || isLoading) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    text: inputText,
    isUser: true,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputText('');
  setIsLoading(true);

  try {
    // Собираем историю чата для контекста
    const chatHistory = [
      // Все предыдущие сообщения
      ...messages.map(msg => ({
        role: msg.isUser ? "user" : "assistant",
        content: msg.text
      })),
      // Текущее сообщение пользователя
      { role: "user", content: inputText }
    ];

    const aiResponse = await AIService.getResponse(chatHistory);
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponse,
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, aiMessage]);
  } catch (error) {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: '⚠️ Произошла ошибка при обращении к AI. Попробуйте ещё раз.',
      isUser: false,
      isError: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
