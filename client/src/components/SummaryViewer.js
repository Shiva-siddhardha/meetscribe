import React, { useState } from 'react';
import { Box, Typography, Button, Paper, MenuItem, Select, CircularProgress, Divider, Stack } from '@mui/material';
import jsPDF from 'jspdf';

const SummaryViewer = ({ transcripts, onSummarize, summary, loading }) => {
  const [selectedSpeaker, setSelectedSpeaker] = useState('all');

  const handleSummarize = () => {
    let text = '';
    let speaker = '';
    if (selectedSpeaker === 'all') {
      text = Object.entries(transcripts)
        .map(([spk, lines]) => `${spk}:\n${lines.join(' ')}`)
        .join('\n');
    } else {
      text = (transcripts[selectedSpeaker] || []).join(' ');
      speaker = selectedSpeaker;
    }
    onSummarize(text, speaker);
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text('Meeting Summary', 10, 10);
    if (summary.per_speaker) {
      let y = 20;
      Object.entries(summary.per_speaker).forEach(([speaker, summ]) => {
        doc.text(`${speaker}:`, 10, y);
        y += 8;
        doc.text(summ, 12, y);
        y += 12;
      });
      doc.text('Overall Summary:', 10, y);
      y += 8;
      doc.text(summary.overall_summary || '', 12, y);
    } else if (Array.isArray(summary)) {
      summary.forEach((line, idx) => {
        doc.text(`- ${line}`, 10, 20 + idx * 8);
      });
    }
    doc.save('meeting-summary.pdf');
  };

  return (
    <Paper elevation={4} sx={{ p: 2, mt: 2, minWidth: 320 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6">Summarize Transcript</Typography>
        <Select
          size="small"
          value={selectedSpeaker}
          onChange={e => setSelectedSpeaker(e.target.value)}
        >
          <MenuItem value="all">All Speakers</MenuItem>
          {Object.keys(transcripts).map(speaker => (
            <MenuItem key={speaker} value={speaker}>{speaker}</MenuItem>
          ))}
        </Select>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSummarize}
        disabled={loading || Object.keys(transcripts).length === 0}
      >
        {loading ? <CircularProgress size={20} /> : 'Summarize'}
      </Button>
      {summary && (summary.per_speaker || summary.overall_summary || Array.isArray(summary)) && (
        <Box mt={2}>
          <Typography variant="subtitle1">Summary:</Typography>
          <Stack spacing={1} mt={1}>
            {summary.per_speaker && Object.entries(summary.per_speaker).map(([speaker, summ]) => (
              <Box key={speaker}>
                <Typography variant="subtitle2" color="primary">{speaker}:</Typography>
                <Typography variant="body2">{summ}</Typography>
              </Box>
            ))}
            {summary.overall_summary && (
              <Box mt={2}>
                <Typography variant="subtitle2" color="secondary">Overall Meeting Summary:</Typography>
                <Typography variant="body2">{summary.overall_summary}</Typography>
              </Box>
            )}
            {Array.isArray(summary) && summary.map((line, idx) => (
              <Typography key={idx} variant="body2">- {line}</Typography>
            ))}
          </Stack>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={handleDownload}>
            Download as PDF
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SummaryViewer; 