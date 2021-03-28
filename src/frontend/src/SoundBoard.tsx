import {Button, Grid, Heading, Text} from "theme-ui";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {SoundData} from "../../common/soundInterface";
import {SocketContext} from "./context/socket";
import {ChannelContext} from "./context/channel";

const SongBox = (props: SoundData) => {
    const socket = useContext(SocketContext)
    const {channelID} = useContext(ChannelContext);

    return (
        <Button
            p={3}
            sx={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
            }}
            onClick={() => socket.emit("play!", {
                channelID,
                sound: props
            })}>
            <Heading sx={{color: "text"}}>{props.name}</Heading>
            <Text sx={{color: "muted"}}>{props.filename}</Text>
        </Button>
    );
}

const SoundBoard = () => {
    const socket = useContext(SocketContext)
    const [songs, setSongs] = useState([])
    const handleSongsRetrieved = useCallback(setSongs, [])

    useEffect(() => {
        socket.emit("songs:get?", {})
        socket.on("songs:get!", handleSongsRetrieved)
        return () => {
            socket.off("songs:get!", handleSongsRetrieved)
        }
    }, [socket])

    return (
        <Grid columns={[2, 3, 4]}>
            {songs.map((song: SoundData) => {
                return <SongBox
                    key={song.filename + song.name}
                    name={song.name}
                    filename={song.filename}
                    groupId={song.groupId}/>
            })}
        </Grid>
    );

}

export default SoundBoard