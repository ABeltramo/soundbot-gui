import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import {emitter} from "./events";
import {YTData} from "../common/ytInterface";
import fs from "fs";
import {log} from "./helpers/log";
import {SoundData} from "../common/soundInterface";


emitter.on("download:yt", async (sound: SoundData, ytData: YTData) => {
    const fileName = sound.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const finalSoundData = {...sound, filename: fileName + ".ogg"}
    const [, output] = await emitter.emitAsync("sounds:get:sound-file", finalSoundData)
    const tmpFile = `./data/${fileName}.mp3`

    try {
        await ytDownload(tmpFile, ytData)
        await ffconvert(output, tmpFile, ytData)
        fs.unlinkSync(tmpFile)
        emitter.emit("sounds:create", finalSoundData)
        return finalSoundData
    } catch (e) {
        log.error("Error during download", e)
        return undefined
    }
})

const ytDownload = (tmpFile: string, {url}: YTData) => {
    return new Promise((resolve, reject) => {
        ytdl(url, {quality: "highestaudio", filter: "audioonly"})
            .pipe(fs.createWriteStream(tmpFile))
            .on("finish", resolve)
            .on("error", reject)
    })
}

const ffconvert = (resultFile: string, tmpFile: string, {start, duration}: YTData) => {
    return new Promise((resolve, reject) => {
        let ffcommand = ffmpeg(tmpFile)
            .audioCodec("libopus")
            .output(resultFile)
            .on("error", reject)
            .on("end", resolve)

        if (start) ffcommand = ffcommand.setStartTime(start)
        if (duration) ffcommand = ffcommand.setDuration(duration)

        ffcommand.run()
    })
}