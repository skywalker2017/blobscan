import { TRPCError } from "@trpc/server";
import type { inferProcedureInput } from "@trpc/server";
import { describe, expect, it } from "vitest";

import type { TRPCContext } from "../src/context";
import { createTRPCInnerContext } from "../src/context";
import { appRouter } from "../src/root";
import type { AppRouter } from "../src/root";

describe("Blob router", async () => {
  it("should get all the blobs", async () => {
    const ctx = (await createTRPCInnerContext()) as TRPCContext;
    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["blob"]["getAll"]>;
    const input: Input = {};

    const result = await caller.blob.getAll(input);
    expect(result).toMatchSnapshot();
  });

  it("should get all the blobs with pagination", async () => {
    const ctx = (await createTRPCInnerContext()) as TRPCContext;
    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["blob"]["getAll"]>;
    const input: Input = {
      p: 2,
      ps: 2,
    };

    const result = await caller.blob.getAll(input);
    expect(result).toMatchSnapshot();
  });

  it("should get a blob by versioned hash", async () => {
    // TODO: setup initial fixture to also have some data on the database
    const ctx = (await createTRPCInnerContext()) as TRPCContext;
    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["blob"]["getByVersionedHash"]>;
    const input: Input = {
      versionedHash: "blobHash004",
    };

    const result = await caller.blob.getByVersionedHash(input);
    expect(result).toMatchSnapshot();
  });
});
