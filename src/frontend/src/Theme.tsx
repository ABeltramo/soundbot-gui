import {Theme, ThemeProvider, useColorMode, merge, Button} from 'theme-ui'
import base_theme from '@theme-ui/preset-base'
import React from "react";
import PropTypes from 'prop-types';


export const ThemeSelector = () => {
    const modes = ['discord', 'deep', 'light']
    const [mode, setMode] = useColorMode()

    function nextTheme() {
        const index = modes.indexOf(mode)
        const next = modes[(index + 1) % modes.length]
        setMode(next)
    }

    return (
        <Button
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
    secondary: '#43af7e',
    accent: '#660099',
    muted: '#35393e',
}

const deep_colors = {
    background: "hsl(230, 25%, 18%)",
    gray: "hsl(210, 50%, 60%)",
    highlight: "hsl(260, 20%, 40%)",
    muted: "hsl(260, 20%, 40%)",
    primary: "hsl(260, 100%, 80%)",
    purple: "hsl(290, 100%, 80%)",
    secondary: "hsl(290, 100%, 80%)",
    text: "hsl(230, 25%, 18%)"
}

class ThemeComponent
    extends React.Component {

    static propTypes = {
        children: PropTypes.node,
    };

    render() {
        const full_theme = merge(base_theme as Theme,
            {
                colors: {
                    modes: {
                        discord: discord_colors,
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
