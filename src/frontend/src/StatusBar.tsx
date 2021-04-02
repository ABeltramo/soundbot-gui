import {Flex, Box, Select, Button, ButtonProps, SelectProps} from "theme-ui";
import {ThemeSelector} from "./Theme";
import "./css/StatusBar.css"
import React, {useCallback, useContext, useEffect, useState} from "react";
import {SocketContext} from "./context/socket";
import {ChannelData} from "../../common/channelInterface";
import {ChannelContext} from "./context/channel";
import {UIContext} from "./context/ui";
import {GroupRowProps} from "./ServerSelector";
import {ResolvedGroup} from "../../common/serverInterface";

const ChannelSelector = (props: SelectProps) => {
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
            {...props}
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

const EditMode = (props: ButtonProps) => {
    const {editing, setEditing} = useContext(UIContext);

    return (
        <Button
            {...props}
            onClick={() => {
                setEditing(!editing)
            }}>
            {editing ? "save" : "edit"}
        </Button>
    )
}

const StatusBar = ({setSelectedServer, group}: GroupRowProps) => {
    return (
        <Flex
            sx={{
                bg: "muted",
                justifyContent: "space-between",
                alignItems: "center"
            }}
            className="status-bar">
            <Flex sx={{flex: 2}}>
                <Button variant="outlined" onClick={() => setSelectedServer({} as ResolvedGroup)}>
                    {group.groupName}
                </Button>
                <ChannelSelector sx={{marginLeft: "5px"}}/>
            </Flex>
            <Box sx={{flex: 1}}/>
            <Flex sx={{flex: 1, justifyContent: "flex-end"}}>
                <EditMode variant="outlined" sx={{marginLeft: "5px"}}/>
                <ThemeSelector variant="outlined" sx={{marginLeft: "5px"}}/>
            </Flex>
        </Flex>
    )
}

export default StatusBar