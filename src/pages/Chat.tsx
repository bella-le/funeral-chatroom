import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Button, Container, Flex, Heading, Input, Text, VStack, HStack } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/avatar';
import { useToast } from '@chakra-ui/toast';
import { supabase, type Character, type Message } from '../supabase';

export default function Chat() {
  const { characterId } = useParams<{ characterId: string }>();
  const toast = useToast();
  const [message, setMessage] = useState('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const maxLength = 255;

  useEffect(() => {
    // Fetch character data
    const fetchCharacter = async () => {
      if (!characterId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', characterId)
          .single();
          
        if (error) throw error;
        setCharacter(data);
      } catch (error) {
        console.error('Error fetching character:', error);
        toast({
          title: 'Error',
          description: 'Could not find your character.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId, toast]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !characterId) return;
    
    setIsSending(true);
    try {
      const newMessage: Message = {
        character_id: characterId,
        content: message.trim()
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(newMessage);
        
      if (error) throw error;
      
      // Clear input after successful send
      setMessage('');
      
      toast({
        title: 'Message sent',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <Container centerContent py={10}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!character) {
    return (
      <Container centerContent py={10}>
        <Text mb={4}>Character not found or you haven't created one yet.</Text>
        <Button as={Link} to="/" colorScheme="blue">
          Create a Character
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Chat Room</Heading>
          <Button as={Link} to="/dollhouse" size="sm" colorScheme="teal">
            View Dollhouse
          </Button>
        </Flex>
        
        <Box p={4} bg="gray.50" borderRadius="md" boxShadow="md">
          <HStack spacing={4}>
            {/* This would be replaced with actual character avatar */}
            <Avatar 
              name={character.name} 
              bg="pink.500"
              size="lg"
            />
            <Box>
              <Text fontWeight="bold">{character.name}</Text>
              <Text fontSize="sm">Chatting as this character</Text>
            </Box>
          </HStack>
        </Box>
        
        <Box 
          p={4} 
          bg="white" 
          borderRadius="md" 
          boxShadow="md"
          position="sticky"
          bottom={4}
        >
          <form onSubmit={handleSendMessage}>
            <Flex gap={2}>
              <Input 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                maxLength={maxLength}
                disabled={isSending}
              />
              <Button 
                type="submit" 
                colorScheme="pink" 
                isLoading={isSending}
                isDisabled={!message.trim()}
              >
                Send
              </Button>
            </Flex>
            <Text fontSize="xs" textAlign="right" mt={1} color="gray.500">
              {message.length}/{maxLength}
            </Text>
          </form>
        </Box>
      </VStack>
    </Container>
  );
}
