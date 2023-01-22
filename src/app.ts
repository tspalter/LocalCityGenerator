import MainGUI from "./ts/ui/main_gui";
import TensorFieldGUI from "./ts/ui/tensor_field_gui";
import { NoiseParams } from "./ts/impl/tensor_field";

const noiseParamsPlaceholder: NoiseParams = {  // Placeholder values for park + water noise
    globalNoise: false,
    noiseSizePark: 20,
    noiseAnglePark: 90,
    noiseSizeGlobal: 30,
    noiseAngleGlobal: 20
};

async function doTheThing(gui: MainGUI): Promise<void> {
    console.log('before generate - ' + gui);
    await gui.generateEverything();

    console.log('after generate - ' + gui);
    await gui.downloadSTL();
}

const tensorField = new TensorFieldGUI(true, noiseParamsPlaceholder);
const gui = new MainGUI(tensorField);

doTheThing(gui)
.then(() => console.log('done'))
.catch((err) => console.log(err));