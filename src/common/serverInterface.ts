import {ChannelData} from "./channelInterface";

export interface GroupData {
    groupId: string
    groupName: string,
    icon?: string
}

export interface ResolvedGroup extends GroupData{
    channels: ChannelData[]
}

export interface ResolvedServers {
    groups: ResolvedGroup[],
    selectedGroupId?: string
}