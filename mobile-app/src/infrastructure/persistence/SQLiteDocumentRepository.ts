import { DatabaseConnection } from './DatabaseConnection';
import { IDocumentRepository } from '@domain/repositories/IDocumentRepository';
import { DocumentEntity } from '@domain/entities/Document';
import { EncryptedDataVO } from '@domain/value-objects/EncryptedData';

/**
 * SQLite implementation of Document Repository
 * Handles storage and retrieval of encrypted medical documents
 */
export class SQLiteDocumentRepository implements IDocumentRepository {
  constructor(private db: DatabaseConnection) {}

  /**
   * Save document to database
   */
  async save(document: DocumentEntity): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO documents (
        id, patient_id, questionnaire_id, type, mime_type,
        file_name, file_size, encrypted_file_path, ocr_data,
        ocr_consent_granted, uploaded_at, updated_at, audit_log
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      document.id,
      document.patientId,
      document.questionnaireId || null,
      document.type,
      document.mimeType,
      document.fileName,
      document.fileSize,
      document.encryptedFilePath,
      document.ocrData ? JSON.stringify(document.ocrData) : null,
      document.ocrConsentGranted ? 1 : 0,
      document.uploadedAt.getTime(),
      document.updatedAt.getTime(),
      JSON.stringify(document.auditLog),
    ];

    await this.db.executeSql(query, params);
  }

  /**
   * Find document by ID
   */
  async findById(id: string): Promise<DocumentEntity | null> {
    const query = 'SELECT * FROM documents WHERE id = ?';
    const results = await this.db.executeSql(query, [id]);

    if (results.rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(results.rows.item(0));
  }

  /**
   * Find all documents for a patient
   */
  async findByPatientId(patientId: string): Promise<DocumentEntity[]> {
    const query = 'SELECT * FROM documents WHERE patient_id = ? ORDER BY uploaded_at DESC';
    const results = await this.db.executeSql(query, [patientId]);

    const documents: DocumentEntity[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      documents.push(this.mapRowToEntity(results.rows.item(i)));
    }

    return documents;
  }

  /**
   * Find all documents for a questionnaire
   */
  async findByQuestionnaireId(questionnaireId: string): Promise<DocumentEntity[]> {
    const query = 'SELECT * FROM documents WHERE questionnaire_id = ? ORDER BY uploaded_at DESC';
    const results = await this.db.executeSql(query, [questionnaireId]);

    const documents: DocumentEntity[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      documents.push(this.mapRowToEntity(results.rows.item(i)));
    }

    return documents;
  }

  /**
   * Find documents by type (e.g., 'insurance_card', 'id_document')
   */
  async findByType(patientId: string, type: string): Promise<DocumentEntity[]> {
    const query = 'SELECT * FROM documents WHERE patient_id = ? AND type = ? ORDER BY uploaded_at DESC';
    const results = await this.db.executeSql(query, [patientId, type]);

    const documents: DocumentEntity[] = [];
    for (let i = 0; i < results.rows.length; i++) {
      documents.push(this.mapRowToEntity(results.rows.item(i)));
    }

    return documents;
  }

  /**
   * Update OCR consent for a document
   */
  async updateOcrConsent(id: string, granted: boolean): Promise<void> {
    const query = `
      UPDATE documents
      SET ocr_consent_granted = ?,
          updated_at = ?
      WHERE id = ?
    `;

    await this.db.executeSql(query, [granted ? 1 : 0, Date.now(), id]);
  }

  /**
   * Update OCR data for a document
   */
  async updateOcrData(
    id: string,
    ocrData: {
      text: string;
      confidence: number;
      language: string;
      blocks?: Array<{
        text: string;
        confidence: number;
        bbox: { x: number; y: number; width: number; height: number };
      }>;
    }
  ): Promise<void> {
    const query = `
      UPDATE documents
      SET ocr_data = ?,
          updated_at = ?
      WHERE id = ?
    `;

    await this.db.executeSql(query, [JSON.stringify(ocrData), Date.now(), id]);
  }

  /**
   * Delete document by ID
   */
  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM documents WHERE id = ?';
    await this.db.executeSql(query, [id]);
  }

  /**
   * Delete all documents for a patient (for GDPR right to deletion)
   */
  async deleteByPatientId(patientId: string): Promise<void> {
    const query = 'DELETE FROM documents WHERE patient_id = ?';
    await this.db.executeSql(query, [patientId]);
  }

  /**
   * Get total storage size for a patient's documents
   */
  async getTotalStorageSize(patientId: string): Promise<number> {
    const query = 'SELECT SUM(file_size) as total FROM documents WHERE patient_id = ?';
    const results = await this.db.executeSql(query, [patientId]);

    if (results.rows.length === 0) {
      return 0;
    }

    return results.rows.item(0).total || 0;
  }

  /**
   * Get document count by type for a patient
   */
  async getCountByType(patientId: string, type: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM documents WHERE patient_id = ? AND type = ?';
    const results = await this.db.executeSql(query, [patientId, type]);

    if (results.rows.length === 0) {
      return 0;
    }

    return results.rows.item(0).count || 0;
  }

  /**
   * Map database row to DocumentEntity
   */
  private mapRowToEntity(row: any): DocumentEntity {
    return DocumentEntity.create({
      id: row.id,
      patientId: row.patient_id,
      questionnaireId: row.questionnaire_id || undefined,
      type: row.type,
      mimeType: row.mime_type,
      fileName: row.file_name,
      fileSize: row.file_size,
      encryptedFilePath: row.encrypted_file_path,
      ocrData: row.ocr_data ? JSON.parse(row.ocr_data) : undefined,
      ocrConsentGranted: row.ocr_consent_granted === 1,
      uploadedAt: new Date(row.uploaded_at),
      updatedAt: new Date(row.updated_at),
      auditLog: JSON.parse(row.audit_log),
    });
  }
}
