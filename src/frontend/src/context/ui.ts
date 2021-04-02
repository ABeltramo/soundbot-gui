import React from "react";

export const UIContext = React.createContext({
    editing: false,
    // eslint-disable-next-line
    setEditing: (t: boolean) => {
    }
})