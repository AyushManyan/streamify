import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../libs/api";
import{
  Channel,
  Chat,
  ChannelHeader,
  MessageList,
  MessageInput,
  Window,
  Thread,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;


const ChatPage = () => {
  const {id:targetUserId} = useParams();
  const [chatClient, setChatClient] = useState();
  const [channel, setChannel] = useState();
  const [loading, setLoading] = useState(true);
  
  const {authUser} = useAuthUser();

  const {data: tokenData} = useQuery({
    queryKey:["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser
  })

  useEffect(()=>{
    const initChat = async () => {
      if(!tokenData || !authUser) return;

      try {
        
        console.log("Initializing chat client with token:", tokenData.token);

        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
        
        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);

      } catch (error) {

        console.error("Error initializing chat client:", error);
        toast.error("Could not connect to chat. Please try again later.");

      }finally{
        setLoading(false);
      }

    }
    initChat();
  },[tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    const callUrl = `${window.location.origin}/call/${channel?.id}`;
    channel.sendMessage({
      text:`I've started a video call. Join here: ${callUrl}`,
    })
    toast.success("Video call link sent to the chat!");
  }



  if(loading||!chatClient || !channel){
    return <ChatLoader />
  }

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall}/>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>

    </div>
  )
}

export default ChatPage