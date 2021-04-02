import {SocketContext} from "./context/socket";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {ResolvedGroup, ResolvedServers} from "../../common/serverInterface";
import {Flex, Avatar, Button, Text} from "theme-ui";


export interface GroupRowProps extends ServerSelectorProps {
    group: ResolvedGroup
}

const GroupRow = ({group, setSelectedServer}: GroupRowProps) => {
    return (
        <Flex sx={{
            margin: "10px",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            maxWidth: "400px"
        }}>
            <Avatar src={group.icon ? `${group.icon}?size=128` : "/undefined.png"}/>
            <Text sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
            }}>{group.groupName}</Text>
            {group.channels.length > 0
                ? <Button
                    sx={{width: "90px"}}
                    onClick={() => setSelectedServer(group)}>
                    USE
                </Button>
                : <Button
                    sx={{width: "90px"}}
                    variant="outlined"
                    onClick={() => window.location.href = "/connect/discord/bot"}>
                    JOIN
                </Button>}
        </Flex>
    )
}

export interface ServerSelectorProps {
    setSelectedServer(group: ResolvedGroup): void
}

const ServerSelector = ({setSelectedServer}: ServerSelectorProps) => {
    const socket = useContext(SocketContext)

    const [groups, setGroups] = useState({
        groups: [],
    } as ResolvedServers)
    const handleGroupsRetrieved = useCallback(setGroups, [])

    useEffect(() => {
        socket.emit("servers:get?", {})
        socket.on("servers:get!", handleGroupsRetrieved)
        return () => {
            socket.off("songs:get!", handleGroupsRetrieved)
        }
    }, [socket])

    return (
        <Flex sx={{
            flexDirection: "column",
            justifyContent: "center",
            height: "100%",
            alignItems: "center",
            overflow: "auto",
            padding: "50px"
        }}>
            {groups.groups
                // We want first the one where the bot is already logged in
                .sort((ga, gb) => {
                    if (ga.channels.length > gb.channels.length) {
                        return -1;
                    } else if (ga.channels.length < gb.channels.length) {
                        return 1;
                    } else {
                        return 0
                    }
                })
                .map(group => {
                    return (
                        <GroupRow key={group.groupId} group={group} setSelectedServer={setSelectedServer}/>
                    )
                })}
        </Flex>
    )
}

export default ServerSelector;