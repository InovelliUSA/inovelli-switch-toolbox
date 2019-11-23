import React from "react";
import PropTypes from "prop-types";
import {
  CssBaseline,
  withStyles,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  TextField,
  InputAdornment,
  IconButton,
  SvgIcon,
  Grid,
  Tooltip,
  AppBar,
  Toolbar
} from "@material-ui/core";
import Brightness0 from "@material-ui/icons/Brightness2";
import Brightness7 from "@material-ui/icons/Brightness7";
import InfiniteIcon from "@material-ui/icons/AllInclusive";
import TimelapseIcon from "@material-ui/icons/Timelapse";
import ThemeProvider from "./ThemeProvider";
import InfoOutlined from "@material-ui/icons/InfoOutlined";
import AboutDialog from "./AboutDialog";

import lzw30sn from "./Inovelli-LZW30-SN.gif";
import NotificationLED from "./NotificationLED";
import { DIMMER_EFFECTS, ONOFF_EFFECTS } from "./Effects";

let Gradient = require("gradient2");
let gradient = new Gradient({
  colors: [
    "rgb(255,0,0)",
    "rgb(255,125,0)",
    "rgb(255,255,0)",
    "rgb(125,255,0)",
    "rgb(0,255,0)",
    "rgb(0,255,125)",
    "rgb(0,255,255)",
    "rgb(0,125,255)",
    "rgb(0,0,255)",
    "rgb(125,0,255)",
    "rgb(255,0,255)",
    "rgb(255,0,125)",
    "rgb(255,0,0)"
  ],
  steps: 256,
  model: "rgb"
});

const LED_COLORS = gradient.toArray("hex");

const durationFormater = val => {
  switch (val) {
    case 255:
      return "Forever";
    case 1:
      return "1 second";
    default:
      if (val > 59) {
        return `${Math.floor(val / 60)} minutes ${val % 60} seconds`;
      } else {
        return `${val} seconds`;
      }
  }
};

function ValueLabelComponent(props) {
  const { children, open, value } = props;

  const popperRef = React.useRef(null);
  React.useEffect(() => {
    if (popperRef.current) {
      popperRef.current.update();
    }
  });

  return (
    <Tooltip
      PopperProps={{
        popperRef
      }}
      open={open}
      enterTouchDelay={0}
      placement="top"
      title={durationFormater(value)}
    >
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  open: PropTypes.bool.isRequired,
  value: PropTypes.number.isRequired
};

const styles = theme => ({
  switchWrapper: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    "&>*": {
      minWidth: "400px"
    }
  },
  switchContainer: {
    position: "relative"
  },
  colorHelper: {
    height: "10px",
    width: "100%",
    background:
      "linear-gradient(to right, rgb(255,0,0), rgb(255,125,0), rgb(255,255,0), rgb(125,255,0), rgb(0,255,0), rgb(0,255,125), rgb(0,255,255), rgb(0,125,255), rgb(0,0,255), rgb(125,0,255), rgb(255,0,255), rgb(255,0,125), rgb(255,0,0))"
  },
  credits: {
    display: "flex",
    position: "absolute",
    bottom: "0",
    right: "0",
    left: "0",
    padding: "15px",
    justifyContent: "space-between"
  },
  optionsContainer: {
    padding: theme.spacing(0, 3)
  },
  switchPicker: {
    marginBottom: theme.spacing(3)
  }
});

//Might Move to this calc in the future. More straight forward

// const longToByteArray = function(/*long*/ long) {
//   // we want to represent the input as a 8-bytes array
//   var byteArray = [0, 0, 0, 0];

//   for (var index = 0; index < byteArray.length; index++) {
//     var byte = long & 0xff;
//     byteArray[index] = byte;
//     long = (long - byte) / 256;
//   }

//   return byteArray;
// };

// const byteArrayToLong = function(/*byte[]*/ byteArray) {
//   var value = 0;
//   for (var i = byteArray.length - 1; i >= 0; i--) {
//     value = value * 256 + byteArray[i];
//   }

//   return value;
// };

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 1,
      duration: 255,
      level: 10,
      effect: "1",
      value: "33491457",
      aboutDialogOpen: false,
      type: "onoff"
    };
    this.configValue = React.createRef();
  }

  setValue = key => (e, v) => {
    this.setState(
      { [key]: key !== "effect" && key !== "type" ? v : e.target.value },
      () => {
        if (this.state.type === "onoff" && this.state.effect === "5") {
          this.setState({ effect: "1" });
        }
        //83823359
        this.setState(lastState => ({
          value:
            parseInt(lastState.color) +
            lastState.level * 256 +
            lastState.duration * 65536 +
            lastState.effect * 16777216
        }));
      }
    );
  };

  openAboutDialog = () => {
    this.setState({ aboutDialogOpen: true });
  };

  closeAboutDialog = () => {
    this.setState({ aboutDialogOpen: false });
  };

  handleCopy = () => {
    if (this.configValue.current) {
      this.configValue.current.select();
      document.execCommand("copy");
    }
  };

  durationFormater = val => {
    switch (val) {
      case 255:
        return "Forever";
      case 1:
        return "1 second";
      default:
        if (val > 59) {
          return `${Math.floor(val / 60)}${val % 60} seconds`;
        } else {
          return `${val} seconds`;
        }
    }
  };

  render() {
    return (
      <ThemeProvider>
        {({ setTheme, themeType }) => (
          <div className={this.props.classes.root}>
            <CssBaseline />
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" style={{ flexGrow: "1" }}>
                  Inovelli LED Notification Calculator
                </Typography>
                <div style={{ flexShrink: "0", flexGrow: "0" }}>
                  <Tooltip title="Light\Dark Theme">
                    <IconButton
                      color="inherit"
                      onClick={() => {
                        setTheme(themeType === "dark" ? "light" : "dark");
                      }}
                    >
                      <SvgIcon>
                        {themeType === "light" ? (
                          <svg viewBox="0 0 24 24">
                            <path d="M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M11,18H13V15.87C14.73,15.43 16,13.86 16,12A4,4 0 0,0 12,8A4,4 0 0,0 8,12C8,13.86 9.27,15.43 11,15.87V18Z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24">
                            <path d="M12,2A7,7 0 0,1 19,9C19,11.38 17.81,13.47 16,14.74V17A1,1 0 0,1 15,18H9A1,1 0 0,1 8,17V14.74C6.19,13.47 5,11.38 5,9A7,7 0 0,1 12,2M9,21V20H15V21A1,1 0 0,1 14,22H10A1,1 0 0,1 9,21M12,4A5,5 0 0,0 7,9C7,11.05 8.23,12.81 10,13.58V16H14V13.58C15.77,12.81 17,11.05 17,9A5,5 0 0,0 12,4Z" />
                          </svg>
                        )}
                      </SvgIcon>
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="About">
                    <IconButton color="inherit" onClick={this.openAboutDialog}>
                      <InfoOutlined />
                    </IconButton>
                  </Tooltip>
                </div>
              </Toolbar>
            </AppBar>
            <div className={this.props.classes.switchWrapper}>
              <div className={this.props.classes.switchContainer}>
                <img alt="Inovelli-LZW30-SN" src={lzw30sn} />
                <span
                  id="frosted-glass-notification-led"
                  className={this.props.classes.notificationLED}
                  style={{
                    opacity: "0.25",
                    zIndex: 3,
                    backgroundColor: "#ffffff"
                  }}
                />
                <NotificationLED
                  style={{
                    bottom: "162px",
                    right: "129px",
                    position: "absolute"
                  }}
                  type={this.state.type}
                  color={LED_COLORS[parseInt(this.state.color)]}
                  effect={this.state.effect}
                  level={this.state.level}
                />
              </div>
              <div className={this.props.classes.optionsContainer}>
                <div className={this.props.classes.switchPicker}>
                  <FormControl fullWidth={true} margin="normal">
                    <InputLabel>Switch Type</InputLabel>
                    <Select
                      value={this.state.type}
                      onChange={this.setValue("type")}
                    >
                      <MenuItem value="onoff">Standard On/Off</MenuItem>
                      <MenuItem value="dimmer">Dimmer</MenuItem>
                    </Select>
                  </FormControl>
                </div>
                <Typography variant="h4" gutterBottom>
                  LED Options
                </Typography>
                <Typography gutterBottom>Color</Typography>
                <div className={this.props.classes.colorHelper} />
                <Slider
                  defaultValue={1}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  step={1}
                  min={1}
                  max={255}
                  value={this.state.color}
                  onChange={this.setValue("color")}
                />

                <Typography gutterBottom>Brightness Level</Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <Brightness0 />
                  </Grid>
                  <Grid item xs>
                    <Slider
                      value={this.state.level}
                      valueLabelDisplay="auto"
                      min={0}
                      max={10}
                      onChange={this.setValue("level")}
                    />
                  </Grid>
                  <Grid item>
                    <Brightness7 />
                  </Grid>
                </Grid>
                <Typography gutterBottom>Duration</Typography>
                <Grid container spacing={2}>
                  <Grid item>
                    <TimelapseIcon />
                  </Grid>
                  <Grid item xs>
                    <Slider
                      value={this.state.duration}
                      valueLabelDisplay="auto"
                      valueLabelFormat={this.durationFormater}
                      marks={[5, 10, 15, 20, 30, 45, 60, 120, 180, 240, 255]}
                      min={1}
                      max={255}
                      onChange={this.setValue("duration")}
                      ValueLabelComponent={ValueLabelComponent}
                    />
                  </Grid>
                  <Grid item>
                    <InfiniteIcon />
                  </Grid>
                </Grid>
                <FormControl fullWidth={true} margin="normal">
                  <InputLabel>Effect</InputLabel>
                  <Select
                    value={this.state.effect}
                    onChange={this.setValue("effect")}
                  >
                    {/* <MenuItem value="0">Off</MenuItem> */}
                    <MenuItem
                      value={
                        this.state.type === "dimmer"
                          ? DIMMER_EFFECTS.SOLID
                          : ONOFF_EFFECTS.SOLID
                      }
                    >
                      Solid
                    </MenuItem>
                    <MenuItem
                      value={
                        this.state.type === "dimmer"
                          ? DIMMER_EFFECTS.FAST_BLINK
                          : ONOFF_EFFECTS.FAST_BLINK
                      }
                    >
                      Fast Blink
                    </MenuItem>
                    <MenuItem
                      value={
                        this.state.type === "dimmer"
                          ? DIMMER_EFFECTS.SLOW_BLINK
                          : ONOFF_EFFECTS.SLOW_BLINK
                      }
                    >
                      Slow Blink
                    </MenuItem>
                    <MenuItem
                      value={
                        this.state.type === "dimmer"
                          ? DIMMER_EFFECTS.PULSE
                          : ONOFF_EFFECTS.PULSE
                      }
                    >
                      Pulse
                    </MenuItem>
                    {this.state.type === "dimmer" && (
                      <MenuItem value={DIMMER_EFFECTS.CHASE}>Chase</MenuItem>
                    )}
                  </Select>
                </FormControl>
                <TextField
                  style={{ marginTop: "60px" }}
                  value={this.state.value}
                  readOnly={true}
                  label="Configuration Value"
                  fullWidth={true}
                  margin="normal"
                  variant="outlined"
                  inputRef={this.configValue}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Copy to Clipboard">
                          <IconButton edge="end" onClick={this.handleCopy}>
                            <SvgIcon>
                              <svg viewBox="0 0 24 24">
                                <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                              </svg>
                            </SvgIcon>
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                />
              </div>
            </div>
            <AboutDialog
              open={this.state.aboutDialogOpen}
              onClose={this.closeAboutDialog}
            />
          </div>
        )}
      </ThemeProvider>
    );
  }
}

export default withStyles(styles)(App);
