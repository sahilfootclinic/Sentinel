import { parseInfoTable } from "@/lib/adapters/edgar13f";
import { parseForm4 } from "@/lib/adapters/edgarForm4";
import { parseRegShoFile } from "@/lib/adapters/finraShort";
import { computeDeltas } from "@/lib/ingest/deltas";
import assert from "assert";

const xml13f = `<?xml version="1.0"?><informationTable xmlns="http://www.sec.gov/edgar/document/thirteenf/informationtable">
<ns1:infoTable><ns1:nameOfIssuer>APPLE INC</ns1:nameOfIssuer><ns1:cusip>037833100</ns1:cusip><ns1:value>915560382000</ns1:value><ns1:shrsOrPrnAmt><ns1:sshPrnamt>915560382</ns1:sshPrnamt><ns1:sshPrnamtType>SH</ns1:sshPrnamtType></ns1:shrsOrPrnAmt></ns1:infoTable>
<ns1:infoTable><ns1:nameOfIssuer>APPLE INC</ns1:nameOfIssuer><ns1:cusip>037833100</ns1:cusip><ns1:value>1000</ns1:value><ns1:shrsOrPrnAmt><ns1:sshPrnamt>10</ns1:sshPrnamt><ns1:sshPrnamtType>SH</ns1:sshPrnamtType></ns1:shrsOrPrnAmt></ns1:infoTable>
<ns1:infoTable><ns1:nameOfIssuer>SOME PUT</ns1:nameOfIssuer><ns1:cusip>999999999</ns1:cusip><ns1:value>5</ns1:value><ns1:shrsOrPrnAmt><ns1:sshPrnamt>5</ns1:sshPrnamt></ns1:shrsOrPrnAmt><ns1:putCall>Put</ns1:putCall></ns1:infoTable>
</informationTable>`;
const rows = parseInfoTable(xml13f, "2026-03-31");
assert.equal(rows.length, 1, "puts excluded, dupes merged");
assert.equal(rows[0]!.valueUsd, 915560383000);
assert.equal(rows[0]!.shares, 915560392);

const old = parseInfoTable(xml13f, "2022-09-30");
assert.equal(old[0]!.valueUsd, 915560383000 * 1000, "pre-2023 values in thousands");

const form4 = `<?xml version="1.0"?><ownershipDocument><issuer><issuerCik>320193</issuerCik><issuerTradingSymbol>AAPL</issuerTradingSymbol></issuer>
<reportingOwner><reportingOwnerId><rptOwnerName>COOK TIMOTHY D</rptOwnerName></reportingOwnerId><reportingOwnerRelationship><isDirector>0</isDirector><isOfficer>1</isOfficer><officerTitle>Chief Executive Officer</officerTitle></reportingOwnerRelationship></reportingOwner>
<nonDerivativeTable><nonDerivativeTransaction><transactionDate><value>2026-06-01</value></transactionDate><transactionCoding><transactionCode>P</transactionCode></transactionCoding><transactionAmounts><transactionShares><value>5000</value></transactionShares><transactionPricePerShare><value>212.5</value></transactionPricePerShare></transactionAmounts></nonDerivativeTransaction>
<nonDerivativeTransaction><transactionDate><value>2026-06-02</value></transactionDate><transactionCoding><transactionCode>A</transactionCode></transactionCoding><transactionAmounts><transactionShares><value>999</value></transactionShares><transactionPricePerShare><value>0</value></transactionPricePerShare></transactionAmounts></nonDerivativeTransaction></nonDerivativeTable></ownershipDocument>`;
const txs = parseForm4(form4, "http://x");
assert.equal(txs.length, 1, "grants (code A) excluded");
assert.deepEqual([txs[0]!.txType, txs[0]!.shares, txs[0]!.priceUsd, txs[0]!.filerRole], ["buy", 5000, 212.5, "Chief Executive Officer"]);

const finra = "Date|Symbol|ShortVolume|ShortExemptVolume|TotalVolume|Market\n20260610|AAPL|1000000|500|4000000|B,Q,N\n20260610|ZZZZ|5|0|10|Q\n";
const sr = parseRegShoFile(finra, new Set(["AAPL"]));
assert.equal(sr.length, 1);
assert.equal(sr[0]!.shortRatio, 0.25);
assert.equal(sr[0]!.asOfDate, "2026-06-10");

const mk = (ticker: string, shares: number) => ({ fundCik: "1", quarter: "2026Q1" as const, ticker, cusip: ticker, issuerName: ticker, valueUsd: shares * 10, shares });
const deltas = computeDeltas(
  [mk("A", 100), mk("B", 100), mk("C", 100), mk("D", 100)],
  [mk("B", 130), mk("C", 105), mk("E", 50)],
);
const types = Object.fromEntries(deltas.map((d) => [d.ticker, d.changeType]));
assert.deepEqual(types, { A: "exit", D: "exit", B: "increase", E: "new" }, "C within ±20% emits no signal");

console.log("ALL PARSER TESTS PASSED");
