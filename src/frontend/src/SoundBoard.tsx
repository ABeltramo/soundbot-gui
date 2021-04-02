import {Box, Button, Grid, Heading, Input, Text} from "theme-ui";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {SoundData} from "../../common/soundInterface";
import {SocketContext} from "./context/socket";
import {ChannelContext} from "./context/channel";
import {runInNewContext} from "vm";
import {UIContext} from "./context/ui";

interface SongElement {
    soundData: SoundData,
    editing: boolean,
    channelID: string,

    updateSong(originalSong: SoundData, updatedSong: SoundData): void
}

const SongButton = ({name, filename, onClick}: { name: string, filename: string, onClick(): void }) => {
    return (
        <Button variant="threeD" p={3} onClick={onClick}>
            <Heading sx={{
                color: "text",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap"
            }}>{name}</Heading>

            <Text sx={{color: "muted", fontSize: 1}}>{filename}</Text>
        </Button>
    )
}

const SongUpdateBox = ({updateSong, soundData}: SongElement) => {
    return (
        <Box
            p={3}
            sx={{bg: "primary", borderRadius: "4px"}}>
            <Input
                onChange={(ev) => {
                    const newName = ev.target.value
                    const newData = {
                        ...soundData,
                        name: newName
                    }
                    updateSong(soundData, newData)
                }}
                value={soundData.name}/>
            <Text sx={{color: "muted"}}>{soundData.filename}</Text>
        </Box>
    )
}

const SongBox = (songData: SongElement) => {
    const socket = useContext(SocketContext)

    if (songData.editing) {
        return (
            <SongUpdateBox {...songData}/>)
    } else {
        return (
            <SongButton
                onClick={() => socket.emit("play!", {
                    channelID: songData.channelID,
                    sound: songData.soundData
                })}
                name={songData.soundData.name}
                filename={songData.soundData.filename}/>
        )
    }
}

const SoundBoard = () => {
    const socket = useContext(SocketContext)
    const {channelID} = useContext(ChannelContext);
    const {editing} = useContext(UIContext);

    const [songs, setSongs] = useState([] as SoundData[])
    const handleSongsRetrieved = useCallback(setSongs, [])
    const updateSong = (originalSong: SoundData, updatedSong: SoundData) => {
        const newSongs = songs.map((song) => {
            if (song === originalSong) {
                return updatedSong
            } else {
                return song
            }
        })

        setSongs(newSongs)
        socket.emit("songs:update!", originalSong, updatedSong)
    }

    useEffect(() => {
        socket.emit("songs:get?", {})
        socket.on("songs:get!", handleSongsRetrieved)
        return () => {
            socket.off("songs:get!", handleSongsRetrieved)
        }
    }, [socket])

    return (
        <Grid columns={[2, 3, 4, 5]}>
            {songs.map((song: SoundData) => {
                return <SongBox
                    key={song.filename}
                    editing={editing}
                    soundData={song}
                    updateSong={updateSong}
                    channelID={channelID}/>
            })}
        </Grid>
    );

}

export default SoundBoard