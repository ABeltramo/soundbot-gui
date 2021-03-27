import React from "react";

export const ChannelContext = React.createContext({
    channelID: "",
    // eslint-disable-next-line
    setSelectedChannel: (channel: string) => {
    }
})