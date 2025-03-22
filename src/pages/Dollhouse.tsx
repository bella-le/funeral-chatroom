import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Container, Flex, Grid, Heading, Text, VStack, HStack } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/avatar';
import { useToast } from '@chakra-ui/toast';
import { supabase, type Character, type Message } from '../supabase';

export default function Dollhouse() {
  const toast = useToast();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [messages, setMessages] = useState<(Message & { character: Character })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch characters and messages
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all characters
        const { data: charactersData, error: charactersError } = await supabase
          .from('characters')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (charactersError) throw charactersError;
        
        // Fetch recent messages with character information
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            character:characters(*)
          `)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (messagesError) throw messagesError;
        
        setCharacters(charactersData || []);
        setMessages((messagesData || []) as (Message & { character: Character })[]);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dollhouse data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel('messages-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages' 
        }, 
        async (payload) => {
          // When a new message comes in, fetch the complete data with character info
          const { data, error } = await supabase
            .from('messages')
            .select(`
              *,
              character:characters(*)
            `)
            .eq('id', payload.new.id)
            .single();
            
          if (error) {
            console.error('Error fetching new message:', error);
            return;
          }
          
          // Add the new message to the state
          if (data) {
            setMessages(prev => [data as (Message & { character: Character }), ...prev]);
          }
        }
      )
      .subscribe();

    // Set up real-time subscription for new characters
    const charactersSubscription = supabase
      .channel('characters-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'characters' 
        }, 
        (payload) => {
          // Add the new character to the state
          setCharacters(prev => [payload.new as Character, ...prev]);
        }
      )
      .subscribe();

    // Clean up subscriptions on unmount
    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(charactersSubscription);
    };
  }, [toast]);

  // Helper function to render a character in the dollhouse
  const renderCharacter = (character: Character) => {
    // In a real implementation, you would use the avatar_config to render different parts
    return (
      <Box 
        key={character.id} 
        bg="white" 
        p={3} 
        borderRadius="md" 
        boxShadow="md"
        position="relative"
        maxW="150px"
      >
        <VStack spacing={2}>
          {/* This would be replaced with actual character avatar based on avatar_config */}
          <Avatar 
            size="xl" 
            name={character.name} 
            bg="pink.500"
          />
          <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
            {character.name}
          </Text>
        </VStack>
      </Box>
    );
  };

  // Helper function to render the message history
  const renderMessageHistory = () => {
    return (
      <VStack spacing={2} align="stretch" maxH="400px" overflowY="auto" p={2}>
        {messages.map(message => (
          <HStack key={message.id} spacing={3} p={2} bg="gray.50" borderRadius="md">
            <Avatar 
              size="sm" 
              name={message.character?.name} 
              bg="pink.500"
            />
            <Box flex="1">
              <Text fontWeight="bold" fontSize="sm">
                {message.character?.name}
              </Text>
              <Text fontSize="md">{message.content}</Text>
            </Box>
          </HStack>
        ))}
      </VStack>
    );
  };

  if (isLoading) {
    return (
      <Container centerContent py={10}>
        <Text>Loading the dollhouse...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Dollhouse View</Heading>
        <Button as={Link} to="/" colorScheme="blue">
          Create Character
        </Button>
      </Flex>

      <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
        {/* Left side - Characters in the dollhouse */}
        <Box flex="2">
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Characters in Room ({characters.length})
          </Text>
          <Box 
            bg="gray.100" 
            p={4} 
            borderRadius="md" 
            minH="500px"
            position="relative"
          >
            {characters.length === 0 ? (
              <Flex justify="center" align="center" h="100%" minH="400px">
                <Text color="gray.500">No characters have joined yet</Text>
              </Flex>
            ) : (
              <Grid 
                templateColumns="repeat(auto-fill, minmax(130px, 1fr))" 
                gap={4}
              >
                {characters.map(renderCharacter)}
              </Grid>
            )}
          </Box>
        </Box>

        {/* Right side - Message history */}
        <Box flex="1">
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            Messages
          </Text>
          <Box 
            bg="white" 
            borderRadius="md" 
            boxShadow="md" 
            p={3}
            maxH="600px"
            overflowY="auto"
          >
            {messages.length === 0 ? (
              <Flex justify="center" align="center" h="100%" minH="200px">
                <Text color="gray.500">No messages yet</Text>
              </Flex>
            ) : (
              renderMessageHistory()
            )}
          </Box>
        </Box>
      </Flex>
    </Container>
  );
}
