// Configure TypeORM DataSource
import {DataSource} from "typeorm";
import {Dataset} from "@/lib/db/entities/dataset.entity";
import {Purchase} from "@/lib/db/entities/purchase.entity";
import {Job} from "@/lib/db/entities/job.entity";

let db: DataSource | null = null;


export async function getDb() {
    if (!db) {
        db = await new DataSource({
            type: 'postgres',
            url: process.env.NEXT_DATABASE_URL,
            entities: [Dataset, Purchase, Job],
            synchronize: process.env.NEXT_PUBLIC_ENV !== 'production',
        })
            .initialize()
    }
    return db;
}