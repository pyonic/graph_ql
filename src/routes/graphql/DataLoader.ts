import * as DataLoader from "dataloader";

const generateDataLoader = (data: any , context: any) => {
    const { table, filterKey } = data;
    const dl = new DataLoader(async (filters: any) => {
        const rows = await context.fastify.db[table].findMany({ key: filterKey, equalsAnyOf: filters })
        
        const sortedData = filters.map((id: any) => rows.filter((x: any) => x[filterKey] === id));

        return sortedData;
    });

    return dl;
}

export { generateDataLoader }