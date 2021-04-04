import {Theme, useColorMode, merge, Button, ButtonProps} from 'theme-ui'
import {ThemeProvider} from '@theme-ui/theme-provider'
import base_theme from '@theme-ui/preset-base'
import React from "react";
import PropTypes from 'prop-types';


export const ThemeSelector = (props: ButtonProps) => {
    const modes = ['dark', 'deep', 'light']
    const [mode, setMode] = useColorMode()

    function nextTheme() {
        const index = modes.indexOf(mode)
        const next = modes[(index + 1) % modes.length]
        setMode(next)
    }

    return (
        <Button
            {...props}
            p={2}
            onClick={nextTheme}>
            {mode}
        </Button>
    )
}

const discord_colors = {
    text: '#fff',
    background: '#303237',
    primary: '#7085d3',
    secondary: '#4766dd',
    accent: '#660099',
    muted: '#35393e',
    danger: '#9d0202'
}

const deep_colors = {
    background: "hsl(230, 25%, 18%)",
    gray: "hsl(210, 50%, 60%)",
    muted: "hsl(231,25%,21%)",
    primary: "hsl(261,55%,67%)",
    secondary: "hsl(267,32%,42%)",
    text: "#fff",
    danger: '#9d0202'
}

class ThemeComponent
    extends React.Component {

    static propTypes = {
        children: PropTypes.node,
    };

    render() {
        const full_theme = merge(base_theme as Theme,
            {
                buttons: {
                    primary: {
                        '&:disabled': {
                            bg: "muted",
                            border: theme => `1px solid ${theme.colors?.primary}`,
                            color: "primary"
                        }
                    },
                    secondary: {
                        bg: "secondary"
                    },
                    danger: {
                        bg: "none",
                        color: "danger",
                        border: theme => `1px solid ${theme.colors?.danger}`,

                        '&:hover': {
                            color: "text",
                            "bg": "danger"
                        }
                    },
                    threeD: {
                        border: theme => `1px solid ${theme.colors?.text}`,
                        boxShadow: theme => `-3px 3px ${theme.colors?.secondary}`,
                        transition: "all .10s ease-out",
                        top: 0,
                        left: 0,
                        position: "relative",
                        '&:active': {
                            left: "-3px",
                            top: "3px",
                            boxShadow: "none"
                        }
                    },
                    outlined: {
                        bg: "transparent",
                        color: "text",
                        border: theme => `1px solid ${theme.colors?.text}`
                    }
                },
                colors: {
                    danger: '#ba0101',
                    modes: {
                        dark: discord_colors,
                        deep: deep_colors
                    }
                }
            })
        return (
            <ThemeProvider theme={full_theme}>
                {this.props.children}
            </ThemeProvider>
        )
    }
}


export default ThemeComponent
