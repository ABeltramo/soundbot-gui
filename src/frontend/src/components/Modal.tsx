import {Box, BoxProps} from "theme-ui"
import "../css/Modal.css"
import React from "react"
import {createPortal} from "react-dom";

export interface ModalProps extends BoxProps {
    open: boolean,

    setOpen(open: boolean): void
}

const Modal = (props: ModalProps) => {
    return createPortal(
        <Box
            sx={{display: props.open ? "block" : "none"}}
            className="modal-wrapper"
            onClick={(e) => {
                // Avoid triggering closing for descendants
                if (e.target !== e.currentTarget)
                    return;
                props.setOpen(false)
            }}>
            <Box className="modal" sx={{margin: "0 auto auto", bg: "muted"}}>
                {props.children}
            </Box>
        </Box>,
        document.body
    )
}

export default Modal;