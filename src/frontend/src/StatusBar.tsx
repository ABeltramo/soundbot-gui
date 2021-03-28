import {Flex, Box, Select} from "theme-ui";
import {ThemeSelector} from "./Theme";
import "./css/StatusBar.css"
import React, {useCallback, useContext, useEffect, useState} from "react";
import {SocketContext} from "./context/socket";
import {ChannelData} from "../../common/channelInterface";
import {ChannelContext} from "./context/channel";

const ChannelSelector = () => {
    const {channelID, setSelectedChannel} = useContext(ChannelContext);

    const socket = useContext(SocketContext)
    const [channels, setChannels] = useState([])
    const handleChannelsRetrieved = useCallback((retrieved_channels) => {
        setSelectedChannel(retrieved_channels[0]['channelId'])
        setChannels(retrieved_channels)
    }, [])

    useEffect(() => {
        socket.emit("channels:get?", {})
        socket.on("channels:get!", handleChannelsRetrieved)
        return () => {
            socket.off("channels:get!", handleChannelsRetrieved)
        }
    }, [socket])


    return (
        <Select
            onChange={(event => setSelectedChannel(event.target.value))}
            value={channelID}>

            {channels.map((channel: ChannelData) => {
                return (
                    <option
                        key={channel.channelId}
                        value={channel.channelId}>
                        {channel.name}
                    </option>
                )
            })}
        </Select>
    );
}

const StatusBar = () => {
    return (
        <Flex
            sx={{bg: "muted"}}
            className="status-bar">
            <Box sx={{flex: '1 1'}}>
                <ChannelSelector/>
            </Box>
            <Box sx={{flex: '4 1 auto'}}/>
            <Box>
                <ThemeSelector/>
            </Box>
        </Flex>
    )
}

export default StatusBar