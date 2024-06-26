import htmlKeyboardResponse from "@jspsych/plugin-html-keyboard-response";
import htmlSliderResponse from "@jspsych/plugin-html-slider-response";
import { flushPromises, pressKey, startTimeline } from "@jspsych/test-utils";

import { initJsPsych } from "../../src";

jest.useFakeTimers();

describe("on_finish (trial)", () => {
  test("should get an object of data generated by the trial", async () => {
    let key_data: string;

    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "hello",
        on_finish: (data) => {
          key_data = data.response;
        },
      },
    ]);

    await pressKey("a");
    expect(key_data).toBe("a");
  });

  test("should be able to write to the data", async () => {
    const { getData } = await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: "hello",
        on_finish: (data) => {
          data.response = 1;
        },
      },
    ]);

    await pressKey("a");
    expect(getData().values()[0].response).toBe(1);
  });
});

describe("on_start (trial)", () => {
  test("should get trial data with function parameters evaluated", async () => {
    let stimulus: string;

    await startTimeline([
      {
        type: htmlKeyboardResponse,
        stimulus: () => "hello",
        on_start: (trial) => {
          stimulus = trial.stimulus;
        },
      },
    ]);

    await pressKey("a");
    expect(stimulus).toBe("hello");
  });

  test("should get trial data with timeline variables evaluated", async () => {
    let d: string;

    const jsPsych = initJsPsych();
    await startTimeline(
      [
        {
          timeline: [
            {
              type: htmlKeyboardResponse,
              stimulus: jsPsych.timelineVariable("stimulus"),
              on_start: (trial) => {
                d = trial.stimulus;
              },
            },
          ],
          timeline_variables: [{ stimulus: "hello" }],
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(d).toBe("hello");
  });
});

describe("on_trial_finish (experiment level)", () => {
  test("should get an object containing the trial data", async () => {
    let key: string;

    const jsPsych = initJsPsych({
      on_trial_finish: (data) => {
        key = data.response;
      },
    });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(key).toBe("a");
  });

  test("should allow writing to the data object", async () => {
    const jsPsych = initJsPsych({
      on_trial_finish: (data) => {
        data.write = true;
      },
    });
    const { getData } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(getData().values()[0].write).toBe(true);
  });
});

describe("on_data_update", () => {
  test("should get an object containing the trial data", async () => {
    let key: string;

    const jsPsych = initJsPsych({
      on_data_update: (data) => {
        key = data.response;
      },
    });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(key).toBe("a");
  });

  test("should contain data with null values", async () => {
    const onDataUpdateFn = jest.fn();

    const jsPsych = initJsPsych({
      on_data_update: onDataUpdateFn,
    });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
          trial_duration: 10,
        },
        {
          type: htmlSliderResponse,
          stimulus: "hello",
          trial_duration: 10,
        },
      ],
      jsPsych
    );

    jest.advanceTimersByTime(10);
    await flushPromises();
    jest.advanceTimersByTime(10);
    await flushPromises();

    expect(onDataUpdateFn).toHaveBeenNthCalledWith(1, expect.objectContaining({ response: null }));
    expect(onDataUpdateFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ response: null, rt: null })
    );
  });

  test("should contain data added with on_finish (trial level)", async () => {
    let trialLevel: boolean;

    const jsPsych = initJsPsych({
      on_data_update: (data) => {
        trialLevel = data.trialLevel;
      },
    });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
          on_finish: (data) => {
            data.trialLevel = true;
          },
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(trialLevel).toBe(true);
  });

  test("should contain data added with on_trial_finish (experiment level)", async () => {
    let experimentLevel: boolean;

    const jsPsych = initJsPsych({
      on_trial_finish: (data) => {
        data.experimentLevel = true;
      },
      on_data_update: (data) => {
        experimentLevel = data.experimentLevel;
      },
    });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(experimentLevel).toBe(true);
  });
});

describe("on_trial_start", () => {
  test("should get an object containing the trial properties", async () => {
    let text: string;

    const jsPsych = initJsPsych({
      on_trial_start: (trial) => {
        text = trial.stimulus;
      },
    });
    await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
        },
      ],
      jsPsych
    );

    await pressKey("a");
    expect(text).toBe("hello");
  });

  test("should allow modification of the trial properties", async () => {
    const jsPsych = initJsPsych({
      on_trial_start: (trial) => {
        trial.stimulus = "goodbye";
      },
    });
    const { getHTML } = await startTimeline(
      [
        {
          type: htmlKeyboardResponse,
          stimulus: "hello",
        },
      ],
      jsPsych
    );

    expect(getHTML()).toMatch("goodbye");
    await pressKey("a");
  });
});

describe("on_timeline_finish", () => {
  test("should fire once when timeline is complete", async () => {
    const onFinishFunction = jest.fn();

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        on_timeline_finish: onFinishFunction,
      },
    ]);

    await pressKey("a");
    expect(onFinishFunction).not.toHaveBeenCalled();
    await pressKey("a");
    expect(onFinishFunction).not.toHaveBeenCalled();
    await pressKey("a");
    expect(onFinishFunction).toHaveBeenCalledTimes(1);
  });

  test("should fire once even with timeline variables", async () => {
    const onFinishFunction = jest.fn();

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        on_timeline_finish: onFinishFunction,
        timeline_variables: [{ x: 1 }, { x: 2 }],
      },
    ]);

    await pressKey("a");
    await pressKey("a");
    expect(onFinishFunction).toHaveBeenCalledTimes(1);
  });
});

describe("on_timeline_start", () => {
  test("should fire once when timeline starts", async () => {
    const onStartFunction = jest.fn();

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        on_timeline_start: onStartFunction,
      },
    ]);

    expect(onStartFunction).toHaveBeenCalledTimes(1);
    await pressKey("a");
    await pressKey("a");
    await pressKey("a");
    expect(onStartFunction).toHaveBeenCalledTimes(1);
  });

  test("should fire once even with timeline variables", async () => {
    const onStartFunction = jest.fn();

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        on_timeline_start: onStartFunction,
        timeline_variables: [{ x: 1 }, { x: 2 }],
      },
    ]);

    expect(onStartFunction).toHaveBeenCalledTimes(1);
    await pressKey("a");
    await pressKey("a");
    expect(onStartFunction).toHaveBeenCalledTimes(1);
  });

  test("should fire after a conditional function", async () => {
    const callback = jest.fn().mockImplementation((str) => str);

    await startTimeline([
      {
        timeline: [
          {
            type: htmlKeyboardResponse,
            stimulus: "foo",
          },
        ],
        on_timeline_start: () => {
          callback("start");
        },
        conditional_function: () => {
          callback("conditional");
          return true;
        },
      },
    ]);

    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback.mock.calls[0][0]).toBe("conditional");
    expect(callback.mock.calls[1][0]).toBe("start");
    await pressKey("a");
  });
});
