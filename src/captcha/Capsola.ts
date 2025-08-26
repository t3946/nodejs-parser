import * as process from "node:process";
import {Log} from "@/Log";

type TCoords = { x: number, y: number }

export class Capsola {
    public static async getResult(taskId: string): Promise<string> {
        while (true) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const request = await fetch("https://api.capsola.cloud/result", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-API-Key": process.env.CAPSOLA_API_KEY || '',
                },
                body: JSON.stringify({id: taskId}),
            });

            const {status, response} = await request.json();

            if (status === 1) {
                return response;
            }

            if (status === 0 && response !== "CAPCHA_NOT_READY") break;
        }

        return ''
    }

    public static async loadImageAsBase64(imageUrl: string): Promise<string> {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return buffer.toString('base64');
    }

    public static async createTask(clickImgBase64: string, taskImgBase64: string) {
        const request = await fetch("https://api.capsola.cloud/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.CAPSOLA_API_KEY || '',
            },
            body: JSON.stringify({
                type: "SmartCaptcha",
                click: clickImgBase64,
                task: taskImgBase64,
            }),
        });
        const {status, response} = await request.json();

        if (status === 1) return response;

        return null;
    }

    public static async solve(clickImgBase64: string, taskImgBase64: string): Promise<TCoords[] | null> {
        let taskId

        while (!taskId) {
            taskId = await Capsola.createTask(clickImgBase64, taskImgBase64)

            if (!taskId) {
                Log.warn("Capsola not returned task id (Did you specified api key?)");
            }
        }

        const result = await Capsola.getResult(taskId);

        if (!result) {
            Log.system('Capsola failed solve captcha')
            return null;
        }

        let coords: TCoords[] = []

        try {
            coords = result
                .split(':')[1]
                .split(';')
                .map(
                    (coordsPair: string) => {
                        const coords = coordsPair
                            .split(',')
                            .map((c: string) => parseFloat(c.substring(2)))

                        return {
                            x: coords[0],
                            y: coords[1],
                        }
                    }
                )
        } catch (error) {
            Log.error(`Captcha not solved, result was: ` + JSON.stringify(result));
        }

        return coords
    }
}