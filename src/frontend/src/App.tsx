import {Container} from "theme-ui";
import React, {useState} from "react";
import {SocketContext, socket} from "./context/socket";
import {ChannelContext} from "./context/channel"
import SoundBoard from "./SoundBoard";
import Theme from './Theme'
import StatusBar from "./StatusBar";


const App = () => {
    const [channelID, setSelectedChannel] = useState("");

    return (
        <SocketContext.Provider value={socket}>
            <ChannelContext.Provider value={{channelID, setSelectedChannel}}>
                <Theme>
                    <Container p={4}>
                        <SoundBoard/>
                    </Container>
                    <StatusBar/>
                </Theme>
            </ChannelContext.Provider>
        </SocketContext.Provider>
    );
}

export default App;
