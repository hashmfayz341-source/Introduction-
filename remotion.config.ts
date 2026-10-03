import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setColorSpace('bt709');
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
