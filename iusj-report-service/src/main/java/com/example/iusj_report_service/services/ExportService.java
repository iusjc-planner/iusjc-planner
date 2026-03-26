package com.example.iusj_report_service.services;

import com.example.iusj_report_service.dto.RapportData;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ExportService {

    public byte[] exportToPdf(RapportData data, String template) {
        try {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, output);
            document.open();

            Paragraph title = new Paragraph(data.getTitre(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            if (data.getMetadata() != null && !data.getMetadata().isEmpty()) {
                for (Map.Entry<String, Object> entry : data.getMetadata().entrySet()) {
                    document.add(new Paragraph(entry.getKey() + ": " + entry.getValue()));
                }
                document.add(new Paragraph(" "));
            }

            List<Map<String, Object>> rows = data.getRows() == null ? List.of() : data.getRows();
            if (!rows.isEmpty()) {
                List<String> headers = new ArrayList<>(rows.get(0).keySet());
                PdfPTable table = new PdfPTable(headers.size());
                table.setWidthPercentage(100f);
                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(header));
                    table.addCell(cell);
                }
                for (Map<String, Object> row : rows) {
                    for (String header : headers) {
                        table.addCell(String.valueOf(row.getOrDefault(header, "")));
                    }
                }
                document.add(table);
            }

            document.close();
            return output.toByteArray();
        } catch (DocumentException ex) {
            throw new IllegalStateException("Erreur generation PDF", ex);
        }
    }

    public byte[] exportToExcel(RapportData data) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("rapport");
            int rowIndex = 0;

            Row titleRow = sheet.createRow(rowIndex++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue(data.getTitre());

            rowIndex++;

            List<Map<String, Object>> rows = data.getRows() == null ? List.of() : data.getRows();
            if (!rows.isEmpty()) {
                List<String> headers = new ArrayList<>(rows.get(0).keySet());
                Row headerRow = sheet.createRow(rowIndex++);
                for (int i = 0; i < headers.size(); i++) {
                    headerRow.createCell(i).setCellValue(headers.get(i));
                }

                for (Map<String, Object> row : rows) {
                    Row xRow = sheet.createRow(rowIndex++);
                    for (int i = 0; i < headers.size(); i++) {
                        xRow.createCell(i).setCellValue(String.valueOf(row.getOrDefault(headers.get(i), "")));
                    }
                }

                for (int i = 0; i < headers.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException ex) {
            throw new IllegalStateException("Erreur generation Excel", ex);
        }
    }

    public byte[] exportToJson(RapportData data) {
        StringBuilder json = new StringBuilder();
        json.append("{\n");
        json.append("  \"titre\": \"").append(escape(data.getTitre())).append("\",\n");
        json.append("  \"type\": \"").append(data.getType()).append("\",\n");
        json.append("  \"generatedAt\": \"").append(data.getGeneratedAt()).append("\",\n");
        json.append("  \"rows\": [\n");

        List<Map<String, Object>> rows = data.getRows() == null ? List.of() : data.getRows();
        for (int i = 0; i < rows.size(); i++) {
            Map<String, Object> row = rows.get(i);
            json.append("    {");
            int col = 0;
            for (Map.Entry<String, Object> entry : row.entrySet()) {
                if (col++ > 0) {
                    json.append(", ");
                }
                json.append("\"").append(escape(entry.getKey())).append("\": \"")
                    .append(escape(String.valueOf(entry.getValue()))).append("\"");
            }
            json.append("}");
            if (i < rows.size() - 1) {
                json.append(",");
            }
            json.append("\n");
        }

        json.append("  ]\n");
        json.append("}\n");
        return json.toString().getBytes(StandardCharsets.UTF_8);
    }

    private String escape(String text) {
        if (text == null) {
            return "";
        }
        return text.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
