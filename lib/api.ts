import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
});

interface AnalyzeParams {
  dbUri: string;
  analysisMode: "initial" | "health_check" | "user_queries";
  queryFileContent?: string;
}

export const performAnalysis = ({
  dbUri,
  analysisMode,
  queryFileContent,
}: AnalyzeParams) => {
  return api.post("/analyze", {
    db_uri: dbUri,
    analysis_mode: analysisMode,
    query_file_content: queryFileContent,
  });
};

export const simulateFix = (
  dbUri: string,
  ddlStatement: string,
  originalQuery: string
) => {
  return api.post("/simulate", {
    db_uri: dbUri,
    ddl_statement: ddlStatement,
    original_query: originalQuery,
  });
};

export const applyFix = (dbUriWrite: string, ddlStatement: string) => {
  return api.post("/apply", {
    db_uri_write: dbUriWrite,
    ddl_statement: ddlStatement,
  });
};
