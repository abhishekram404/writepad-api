import { debounce } from "lodash";
import Pad from "../models/PadModel";
export const debouncedSaveToDatabase = debounce(async function (padCode, text) {
  const foundPad = await Pad.findOneAndUpdate(
    { padCode: padCode },
    {
      text: text,
    },
    {
      upsert: true,
    }
  );
}, 500);
