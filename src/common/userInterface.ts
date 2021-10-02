
import {SoundData} from "./soundInterface"

export interface UserData {
    groupId: string,
    userId: string,
    name: string,
    icon: string,
    enterSound?: SoundData,
    leaveSound?: SoundData
}