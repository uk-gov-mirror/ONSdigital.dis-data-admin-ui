'use server'

import { cookies } from "next/headers";

import { httpPost, SSRequestConfig } from "@/utils/request/request";

import { z } from "zod";
 
const schema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    id: z.string().min(1, { message: "ID is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    contacts: z.array(z.object({
        name: z.string(),
        email: z.string()
    })).min(1, { message: "A contact is required" })
})

export async function createDatasetSeries(currentstate, formData) {
    let response = {}

    const datasetSeriesSubmission = {
        title: formData.get('dataset-series-title'),
        id: formData.get('dataset-series-id'),
        description: formData.get('dataset-series-description'),
        contacts: JSON.parse(formData.get('dataset-series-contacts'))
    }

    const result = schema.safeParse(datasetSeriesSubmission)
    response.success = result.success

    if (!response.success) {
        response.errors = result.error.flatten().fieldErrors
        response.submission = datasetSeriesSubmission
    } else {
        const reqCfg = await SSRequestConfig(cookies);
        try {
            const data = await httpPost(reqCfg, "/datasets", datasetSeriesSubmission);
            if (data.status == 403) {
                response.success = false
                response.recentlySubmitted = false
                response.code = data.status
            } else {
                response.recentlySubmitted = true
            }
        } catch (err) {
            return err.toString();
        }
    }
    return response
}
