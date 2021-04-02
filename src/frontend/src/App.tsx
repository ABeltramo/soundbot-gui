import {Container} from "theme-ui";
import React, {useState} from "react";
import {SocketContext, socket} from "./context/socket";
import {ChannelContext} from "./context/channel"
import SoundBoard from "./SoundBoard";
import Theme from './Theme'
import StatusBar from "./StatusBar";
import {UIContext} from "./context/ui";
import ServerSelector from "./ServerSelector";
import {GroupData, ResolvedGroup} from "../../common/serverInterface";


const App = () => {
    const [selectedServer, setSelectedServer] = useState({} as ResolvedGroup)
    const [channelID, setSelectedChannel] = useState("");
    const [editing, setEditing] = useState(false);

    const onSelectedServer = (group: ResolvedGroup) => {
        setSelectedServer(group)
        socket.emit("servers:select!", group)
    }

    return (
        <SocketContext.Provider value={socket}>
            <ChannelContext.Provider value={{channelID, setSelectedChannel}}>
                <UIContext.Provider value={{editing, setEditing}}>
                    <Theme>
                        {selectedServer.groupId
                            ? <Container>
                                <Container p={4}>
                                    <SoundBoard/>
                                </Container>
                                <StatusBar group={selectedServer} setSelectedServer={onSelectedServer}/>
                            </Container>
                            : <ServerSelector setSelectedServer={onSelectedServer}/>
                        }
                    </Theme>
                </UIContext.Provider>
            </ChannelContext.Provider>
        </SocketContext.Provider>
    );
}

export default App;
