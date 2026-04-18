import React from "react";
import { Card, CardActionArea, CardContent, Typography } from "@mui/material";

/**
 * @param {{ title: string, description?: string, onOpen: () => void }} props
 */
export function BoardTile({ title, description, onOpen }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardActionArea onClick={onOpen} sx={{ height: "100%", alignItems: "stretch" }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={800} gutterBottom>
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                whiteSpace: "normal"
              }}
            >
              {description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No description
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
