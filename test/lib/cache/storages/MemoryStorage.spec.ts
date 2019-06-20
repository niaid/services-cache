import * as Assert from "assert";
import { MemoryStorage } from '../../../../lib/cache/storages/memory.storage';

describe("MemoryStorage", () => {
    it("Should add cache item correctly", async () => {
        const storage = new MemoryStorage();
        const content = { data: { name: "deep" } };
        const key = "test";

        await storage.setItem(key, content); 
        Assert.strictEqual(await storage.getItem(key), content);
    });
});