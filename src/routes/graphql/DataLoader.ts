import * as DataLoader from "dataloader"

const generateDataLoader = (data: any , context: any) => {
    const { table, filterKey, multiple } = data;
    const dl = new DataLoader(async (filters: any) => {
        const rows = await context.fastify.db[table].findMany({ key: filterKey, equalsAnyOf: filters })
        let sortedData = null;
        
        if (multiple) {
            sortedData = filters.map((id: any) => rows.filter((x: any) => x[filterKey] === id));
        } else {
            sortedData = filters.map((id: any) => rows.find((x: any) => x[filterKey] === id));
        }

        return sortedData;
    });

    return dl;
}

export { generateDataLoader }