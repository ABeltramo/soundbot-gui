import React, {useContext, useEffect, useState} from "react";
import {Box, Button, Field, Flex, Heading, Text, FieldProps, InputProps, Spinner} from "theme-ui";
import {SocketContext} from "./context/socket";
import {SoundData} from "../../common/soundInterface";

interface MFieldProps extends InputProps {
    formState: Record<string, string>,

    setFormState(s: Record<string, string>): void
}

interface DownloadResult extends SoundData {
    error?: boolean,
    msg?: string
}

const ManagedField = (props: FieldProps<React.ComponentType<MFieldProps>>) => {

    const {name, formState} = props

    return (
        <Field
            {...props}
            value={formState[name]}
            onChange={(e: { target: { value: any; }; }) => props.setFormState({...formState, [name]: e.target.value})}
        />
    )
}

const YTDL = ({setOpen} : {setOpen(open: boolean): void}) => {

    const [formState, setFormState] = useState({
        url: "",
        start: "",
        duration: "",
        name: ""
    } as Record<string, string>)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState({} as DownloadResult)
    const socket = useContext(SocketContext)

    const handleSoundDownloaded = (res: DownloadResult) => {
        setLoading(false)
        setResult(res)
        if(!res.error){
            setOpen(false)
        }
    }

    useEffect(() => {
        socket.on("download:yt!", handleSoundDownloaded)
        return () => {
            socket.off("download:yt!", handleSoundDownloaded)
        }
    }, [socket])

    return (
        <Box as="form" onSubmit={(e) => {
            e.preventDefault()
            setLoading(true)
            setResult({} as DownloadResult)

            const ytData = {
                url: formState.url,
                start: formState.start.length === 0 ? undefined : formState.start,
                duration: formState.duration.length === 0 ? undefined : formState.duration
            }
            socket.emit("download:yt?", formState.name, ytData)
        }}>
            <Heading sx={{margin: "6px", textAlign: "center"}}>
                Download a sound from YouTube
            </Heading>

            <ManagedField formState={formState} setFormState={setFormState}
                label="YouTube URL" placeholder="https://youtube.com/..." name="url" mb={4}/>
            <Flex sx={{
                justifyContent: "space-evenly"
            }} mb={4}>
                <ManagedField formState={formState} setFormState={setFormState}
                    label="start" placeholder="0:00" name="start"/>
                <ManagedField formState={formState} setFormState={setFormState}
                    label="duration" placeholder="0:05" name="duration"/>
            </Flex>
            <ManagedField formState={formState} setFormState={setFormState}
                label="Sound name" placeholder="A funny sound name" name="name" mb={4}/>

            <Flex sx={{position: "absolute", bottom: "0", right: "0", width: "100%", justifyContent: "flex-end", alignItems: "center"}}>
                <Text as="h3" m="10px">
                    {result.error ? result.msg : ""}
                </Text>
                <Button
                    m="10px"
                    disabled={loading}
                    type="submit">
                    {loading
                        ? <Spinner size={24}/>
                        : "Download"}
                </Button>
            </Flex>

        </Box>
    )
}

export default YTDL