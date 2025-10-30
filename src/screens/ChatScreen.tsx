import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { GiftedChat, IMessage, Bubble, InputToolbar } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatWithAI, detectUrgency, validateWithGPT, ChatContext } from '../services/ai';
import { saveChatMessage, getChatHistory, createTemporaryUser } from '../services/supabase';

export default function ChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      // Buscar ou criar usuário
      let storedUserId = await AsyncStorage.getItem('userId');
      if (!storedUserId) {
        const user = await createTemporaryUser();
        if (user) {
          storedUserId = user.id;
          await AsyncStorage.setItem('userId', storedUserId);
        }
      }
      setUserId(storedUserId || '');

      // Buscar histórico
      if (storedUserId) {
        const history = await getChatHistory(storedUserId);
        const formattedMessages = history.flatMap(msg => {
          const userMsg: IMessage = {
            _id: `${msg.id}-user`,
            text: msg.message,
            createdAt: new Date(msg.created_at),
            user: { _id: 1, name: 'Usuário' },
          };
          
          const assistantMsg: IMessage = {
            _id: `${msg.id}-assistant`,
            text: msg.response,
            createdAt: new Date(msg.created_at),
            user: { _id: 2, name: 'Assistente', avatar: '👩‍⚕️' },
          };
          
          // Retornar ambas as mensagens: user primeiro, depois assistant
          // Timestamps ligeiramente ajustados para manter ordem visual
          const baseTimestamp = new Date(msg.created_at).getTime();
          return [
            { ...userMsg, createdAt: new Date(baseTimestamp) },
            { ...assistantMsg, createdAt: new Date(baseTimestamp + 1000) }
          ];
        });
        setMessages(formattedMessages);
      }

      // Mensagem inicial
      const welcomeMessage = {
        _id: Math.random().toString(36).substring(7),
        text: 'Oi! 👋 Sou sua assistente virtual de maternidade. Como posso te ajudar hoje? 💕',
        createdAt: new Date(),
        user: { _id: 2, name: 'Assistente', avatar: '👩‍⚕️' },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [welcomeMessage]));
    } catch (error) {
      console.error('Erro ao inicializar chat:', error);
    }
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    
    // Detectar urgência
    if (detectUrgency(userMessage.text)) {
      Alert.alert(
        '🚨 ATENÇÃO!',
        'Se você está com sangramento intenso, dor forte, desmaio ou qualquer sintoma preocupante, PROCURE AJUDA MÉDICA IMEDIATAMENTE.\n\nLigue para o SAMU: 192',
        [{ text: 'Entendi', style: 'default' }]
      );
    }

    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setLoading(true);

    try {
      // Buscar contexto do usuário
      const profileJson = await AsyncStorage.getItem('userProfile');
      const context: ChatContext = profileJson ? JSON.parse(profileJson) : {};

      // Preparar histórico para IA
      const aiHistory = messages
        .slice(-10)
        .reverse()
        .map(msg => ({
          role: msg.user._id === 1 ? 'user' as const : 'assistant' as const,
          content: msg.text,
        }));

      // Obter resposta da IA
      const aiResponse = await chatWithAI(userMessage.text, context, aiHistory);

      // Validação dupla com GPT (opcional, comentado para performance)
      // const isValid = await validateWithGPT(aiResponse);
      // if (!isValid) {
      //   aiResponse = 'Desculpa, tive um pequeno problema. Pode reformular sua pergunta? 💕';
      // }

      const responseMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        text: aiResponse,
        createdAt: new Date(),
        user: { _id: 2, name: 'Assistente', avatar: '👩‍⚕️' },
      };

      setMessages(previousMessages => GiftedChat.append(previousMessages, [responseMessage]));

      // Salvar no Supabase
      if (userId) {
        await saveChatMessage({
          user_id: userId,
          message: userMessage.text,
          response: aiResponse,
          context_data: context,
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      const errorMessage: IMessage = {
        _id: Math.random().toString(36).substring(7),
        text: 'Ops! Tive um probleminha. Pode tentar novamente? 💕',
        createdAt: new Date(),
        user: { _id: 2, name: 'Assistente' },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [errorMessage]));
    } finally {
      setLoading(false);
    }
  }, [messages, userId]);

  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: '#E91E63',
        },
        left: {
          backgroundColor: '#FFE5F1',
        },
      }}
      textStyle={{
        right: { color: '#fff' },
        left: { color: '#333' },
      }}
    />
  );

  const quickReplies = [
    { text: '🤰 Dúvida sobre gravidez', onPress: () => onSend([{ _id: '1', text: 'Tenho uma dúvida sobre gravidez', createdAt: new Date(), user: { _id: 1 } }]) },
    { text: '💡 Dica do dia', onPress: () => onSend([{ _id: '2', text: 'Me dê uma dica do dia', createdAt: new Date(), user: { _id: 1 } }]) },
    { text: '📊 Meu progresso', onPress: () => onSend([{ _id: '3', text: 'Como está meu progresso?', createdAt: new Date(), user: { _id: 1 } }]) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conversar</Text>
        <TouchableOpacity>
          <Text style={styles.headerEmergency}>🚨 SOS</Text>
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        placeholder="Digite sua mensagem..."
        isLoadingEarlier={loading}
        scrollToBottom
      />

      <View style={styles.quickReplies}>
        {quickReplies.map((reply, index) => (
          <TouchableOpacity key={index} style={styles.quickReplyButton} onPress={reply.onPress}>
            <Text style={styles.quickReplyText}>{reply.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFE5F1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFB6D4',
  },
  headerBack: {
    fontSize: 16,
    color: '#E91E63',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerEmergency: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  quickReplies: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  quickReplyButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFB6D4',
  },
  quickReplyText: {
    fontSize: 12,
    color: '#E91E63',
  },
});

