import { TRPCError } from "@trpc/server";
import type { inferProcedureInput } from "@trpc/server";
import type { NodeHTTPRequest } from "@trpc/server/adapters/node-http";
import jwt from "jsonwebtoken";
import { describe, expect, it, vi } from "vitest";

import type { TRPCContext } from "../src/context";
import { createTRPCInnerContext, getJWTFromRequest } from "../src/context";
import { appRouter } from "../src/root";
import type { AppRouter } from "../src/root";

vi.mock("../src/env", () => ({
  env: {
    SECRET_KEY: "supersecret",
  },
}));

describe("Indexer router", async () => {
  it("should return the current slot", async () => {
    const ctx = (await createTRPCInnerContext()) as TRPCContext;
    const caller = appRouter.createCaller(ctx);

    const result = await caller.indexer.getSlot();

    expect(result).toMatchObject({ slot: 0 });
  });

  it("should not update the slot if not auth", async () => {
    const ctx = (await createTRPCInnerContext()) as TRPCContext;
    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["indexer"]["updateSlot"]>;
    const input: Input = {
      slot: 10,
    };

    await expect(caller.indexer.updateSlot(input)).rejects.toThrow(
      new TRPCError({ code: "UNAUTHORIZED" })
    );
  });

  it("should update the slot if auth", async () => {
    const token = jwt.sign("foobar", "supersecret");
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as NodeHTTPRequest;
    const apiClient = getJWTFromRequest(req);
    console.log("ApiClient", apiClient);
    const ctx = (await createTRPCInnerContext({
      apiClient: apiClient,
    })) as TRPCContext;

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["indexer"]["updateSlot"]>;
    const input: Input = {
      slot: 10,
    };

    await caller.indexer.updateSlot(input);

    const result = await caller.indexer.getSlot();

    expect(result).toMatchObject({ slot: 10 });
  });

  it("should index new data if auth", async () => {
    const token = jwt.sign("foobar", "supersecret");
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as NodeHTTPRequest;
    const apiClient = getJWTFromRequest(req);
    console.log("ApiClient", apiClient);
    const ctx = (await createTRPCInnerContext({
      apiClient: apiClient,
    })) as TRPCContext;

    const caller = appRouter.createCaller(ctx);
    type Input = inferProcedureInput<AppRouter["indexer"]["indexData"]>;
    const input: Input = {
      block: {
        number: 1003,
        hash: "blockHash001",
        timestamp: 1630257174,
        slot: 103,
        blobGasUsed: "10000",
        excessBlobGas: "5000",
      },
      transactions: [
        {
          hash: "txHash008",
          from: "address1",
          to: "address3",
          blockNumber: 1003,
          gasPrice: "20000",
          maxFeePerBlobGas: "15000",
        },
        {
          hash: "txHash009",
          from: "address4",
          to: "address6",
          blockNumber: 1003,
          gasPrice: "10000",
          maxFeePerBlobGas: "1800",
        },
        {
          hash: "txHash010",
          from: "address4",
          to: "address2",
          blockNumber: 1003,
          gasPrice: "3000000",
          maxFeePerBlobGas: "20000",
        },
      ],
      blobs: [
        {
          versionedHash: "blobHash008",
          commitment: "commitment008",
          data: "0x34567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          txHash: "txHash008",
          index: 0,
        },
        {
          versionedHash: "blobHash009",
          commitment: "commitment009",
          data: "0x34567890abcdef1234567890abcdef",
          txHash: "txHash009",
          index: 0,
        },
        {
          versionedHash: "blobHash010",
          commitment: "commitment010",
          data: "0x34567890abcdef1234567890abcdef1234567890abcdef",
          txHash: "txHash010",
          index: 0,
        },
      ],
    };

    await caller.indexer.indexData(input);

    const result = await caller.block.getByBlockNumber({
      number: 1003,
    });
    expect(result).toMatchSnapshot();
  });
});
