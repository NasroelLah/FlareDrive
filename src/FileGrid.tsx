import React from "react";
import {
  Box,
  Grid,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MimeIcon from "./MimeIcon";

export interface FileItem {
  key: string;
  size: number;
  uploaded: string;
  httpMetadata: { contentType: string };
  customMetadata?: { thumbnail?: string };
}

function humanReadableSize(size: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (size >= 1024) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function extractFilename(key: string) {
  return key.split("/").pop();
}

export function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function isDirectory(file: FileItem) {
  return file.httpMetadata?.contentType === "application/x-directory";
}

function FileGrid({
  files,
  onCwdChange,
  multiSelected,
  onMultiSelect,
  emptyMessage,
}: {
  files: FileItem[];
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  emptyMessage?: React.ReactNode;
}) {
  return files.length === 0 ? (
    emptyMessage
  ) : (
    <Grid container sx={{ paddingBottom: "48px" }}>
      {files.map((file) => (
        <Grid item key={file.key} xs={12} sm={6} md={4} lg={3} xl={2}>
          <ListItemButton
            component="a"
            href={`/api/${encodeKey(file.key)}`}
            target="_blank"
            rel="noopener noreferrer"
            selected={multiSelected?.includes(file.key)}
            onClick={(event) => {
              if (multiSelected !== null) {
                onMultiSelect(file.key);
                event.preventDefault();
              } else if (isDirectory(file)) {
                onCwdChange(file.key + "/");
                event.preventDefault();
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onMultiSelect(file.key);
            }}
          >
            <ListItemIcon>
              {file.customMetadata?.thumbnail ? (
                <img
                  src={`/api/_$flaredrive$/thumbnails/${file.customMetadata.thumbnail}.png`}
                  alt={file.key}
                  style={{ width: 36, height: 36, objectFit: "cover" }}
                />
              ) : (
                <MimeIcon contentType={file.httpMetadata.contentType} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={extractFilename(file.key)}
              primaryTypographyProps={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              secondary={
                <React.Fragment>
                  <Box
                    sx={{
                      display: "inline-block",
                      minWidth: "160px",
                      marginRight: 1,
                    }}
                  >
                    {new Date(file.uploaded).toLocaleString()}
                  </Box>
                  {!isDirectory(file) && humanReadableSize(file.size)}
                </React.Fragment>
              }
            />
          </ListItemButton>
        </Grid>
      ))}
    </Grid>
  );
}

export default FileGrid;
