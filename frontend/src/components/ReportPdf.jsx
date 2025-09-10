// frontend/src/components/ReportPdf.jsx
import React from 'react';
import { PDFDownloadLink, Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 20 },
  header: { backgroundColor:'#9b59b6', padding: 10, textAlign:'center' },
  title: { fontSize: 22, color: 'white' },
  section: { marginTop: 12 },
  imagesRow: { display: 'flex', flexDirection:'row', justifyContent:'space-between', marginTop:10 },
  img: { width: 170, height: 120, objectFit:'cover', borderRadius:6, border:'1px solid #ddd' },
  label: { marginTop:6, textAlign:'center', fontSize:10 }
});

export default function ReportPdf({ submission }){
  if(!submission) return null;

  const MyDoc = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Oral Health Screening Report</Text>
        </View>

        <View style={styles.section}>
          <Text>Name: {submission.patientName}</Text>
          <Text>Patient ID: {submission.patientID}</Text>
          <Text>Date: {new Date(submission.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={{ ...styles.section }}>
          <Text>SCREENING REPORT:</Text>
          <View style={styles.imagesRow}>
            <View>
              {submission.annotatedUpperUrl ? <Image style={styles.img} src={submission.annotatedUpperUrl} /> : <Image style={styles.img} src={submission.imageUpperUrl} />}
              <Text style={styles.label}>Upper Teeth</Text>
            </View>
            <View>
              {submission.annotatedFrontUrl ? <Image style={styles.img} src={submission.annotatedFrontUrl} /> : <Image style={styles.img} src={submission.imageFrontUrl} />}
              <Text style={styles.label}>Front Teeth</Text>
            </View>
            <View>
              {submission.annotatedLowerUrl ? <Image style={styles.img} src={submission.annotatedLowerUrl} /> : <Image style={styles.img} src={submission.imageLowerUrl} />}
              <Text style={styles.label}>Lower Teeth</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text>TREATMENT RECOMMENDATIONS:</Text>
          <Text>- Based on observations, visit dentist for details.</Text>
          <Text>Notes: {submission.note || '-'}</Text>
        </View>
      </Page>
    </Document>
  );

  return (
    <div style={{ marginTop: 8 }}>
      <PDFDownloadLink document={<MyDoc/>} fileName={`oralvis-report-${submission._id}.pdf`}>
        {({ blob, url, loading, error }) => (loading ? 'Preparing document...' : <button className='btn primary'>Download PDF (Client)</button>)}
      </PDFDownloadLink>
    </div>
  );
}
