import {Box, Button, Grid, Heading, Input, Text} from "theme-ui";
import React, {useCallback, useContext, useEffect, useState} from "react";
import {SoundData} from "../../common/soundInterface";
import {SocketContext} from "./context/socket";
import {ChannelContext} from "./context/channel";
import {UIContext} from "./context/ui";

interface SongElement {
    soundData: SoundData,
    editing: boolean,
    channelID: string,

    updateSong(originalSong: SoundData, updatedSong: SoundData): void

    deleteSong(song: SoundData): void
}

const SongButton = ({name, filename, onClick}: { name: string, filename: string, onClick(): void }) => {
    return (
        <Button variant="threeD" p={3} onClick={onClick}>
            <Heading className="text-ellipsis" sx={{color: "text"}}>{name}</Heading>
            <Text className="text-ellipsis" sx={{color: "muted", fontSize: 1}}>{filename}</Text>
        </Button>
    )
}

const SongUpdateBox = ({updateSong, soundData, deleteSong}: SongElement) => {
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
            <Text as="h5" className="text-ellipsis" sx={{color: "muted"}}>{soundData.filename}</Text>
            <Button variant="danger" onClick={() => deleteSong(soundData)}>Delete</Button>
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

    const handleSongAdded = (song: SoundData) => {
        setSongs(prevState => [...prevState, song])
    }

    const handleDeleteSong = (song: SoundData) => {
        setSongs(prevState => {
            return prevState.filter((element) => song !== element)
        })
        socket.emit("songs:remove!", song)
    }

    useEffect(() => {
        socket.emit("songs:get?", {})
        socket.on("songs:get!", handleSongsRetrieved)
        socket.on("songs:create!", (s) => handleSongAdded(s))
        return () => {
            socket.off("songs:get!")
            socket.off("songs:create!")
        }
    }, [socket])

    return (
        <Grid columns={[2, 3, 4, 5]} sx={{marginBottom: "50px"}}>
            {songs.map((song: SoundData) => {
                return <SongBox
                    key={song.filename}
                    editing={editing}
                    soundData={song}
                    updateSong={updateSong}
                    deleteSong={handleDeleteSong}
                    channelID={channelID}/>
            })}
        </Grid>
    );

}

export default SoundBoard