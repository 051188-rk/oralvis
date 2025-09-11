import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// This function will handle the PDF generation and download
export const generateAndDownloadPdf = (submission) => {
  // 1. Create a hidden element to render the report
  const reportElement = document.createElement('div');
  reportElement.style.position = 'fixed';
  reportElement.style.left = '-9999px'; // Position it off-screen
  reportElement.style.width = '1000px'; // Set a fixed width for consistent rendering
  reportElement.style.fontFamily = 'Arial, sans-serif';

  // 2. Define the color palette based on your demo
  const colors = {
    red: '#e74c3c',
    yellow: '#f1c40f',
    purple: '#9b59b6',
    blue: '#3498db',
    teal: '#1abc9c',
    pink: '#e84393'
  };

  // 3. Populate the element with the report's HTML structure
  reportElement.innerHTML = `
    <div style="padding: 20px; background-color: #f5f7fa; border: 1px solid #ddd;">
      <div style="text-align: center; padding: 10px; background-color: ${colors.purple}; color: white; border-radius: 8px;">
        <h1 style="font-size: 24px; margin: 0;">Oral Health Screening Report</h1>
      </div>

      <div style="margin-top: 20px; font-size: 14px; display: flex; justify-content: space-between;">
        <span><strong>Name:</strong> ${submission.patientName}</span>
        <span><strong>Patient ID:</strong> ${submission.patientID || 'N/A'}</span>
        <span><strong>Date:</strong> ${new Date(submission.createdAt).toLocaleDateString()}</span>
      </div>

      <h2 style="margin-top: 25px; font-size: 18px;">SCREENING REPORT:</h2>
      <div style="display: flex; justify-content: space-around; gap: 15px; text-align: center; margin-top: 10px;">
        <div style="flex: 1;">
          <img src="${submission.annotatedUpperUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #ccc;"/>
          <div style="background-color: ${colors.red}; color: white; padding: 8px; border-radius: 5px; margin-top: 5px;">Upper Teeth</div>
        </div>
        <div style="flex: 1;">
          <img src="${submission.annotatedFrontUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #ccc;"/>
          <div style="background-color: ${colors.red}; color: white; padding: 8px; border-radius: 5px; margin-top: 5px;">Front Teeth</div>
        </div>
        <div style="flex: 1;">
          <img src="${submission.annotatedLowerUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #ccc;"/>
          <div style="background-color: ${colors.red}; color: white; padding: 8px; border-radius: 5px; margin-top: 5px;">Lower Teeth</div>
        </div>
      </div>

      <div style="margin-top: 25px; display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; font-size: 12px;">
        <span style="display: flex; align-items: center;"><div style="width: 15px; height: 15px; background-color: ${colors.purple}; margin-right: 5px;"></div>Inflammed/Red gums</span>
        <span style="display: flex; align-items: center;"><div style="width: 15px; height: 15px; background-color: ${colors.yellow}; margin-right: 5px;"></div>Malaligned</span>
        <span style="display: flex; align-items: center;"><div style="width: 15px; height: 15px; background-color: ${colors.purple}; margin-right: 5px; opacity: 0.6;"></div>Receded gums</span>
        <span style="display: flex; align-items: center;"><div style="width: 15px; height: 15px; background-color: ${colors.red}; margin-right: 5px;"></div>Stains</span>
        <span style="display: flex; align-items: center;"><div style="width: 15px; height: 15px; background-color: ${colors.teal}; margin-right: 5px;"></div>Attrition</span>
        <span style="display: flex; align-items: center;"><div style="width: 15px; height: 15px; background-color: ${colors.pink}; margin-right: 5px;"></div>Crowns</span>
      </div>

      <h2 style="margin-top: 25px; font-size: 18px;">TREATMENT RECOMMENDATIONS:</h2>
      <div style="font-size: 14px;">
        <p><strong>Inflammed or Red gums:</strong> Scaling.</p>
        <p><strong>Malaligned:</strong> Braces or Clear Aligner.</p>
        <p><strong>Receded gums:</strong> Gum Surgery.</p>
        <p><strong>Stains:</strong> Teeth cleaning and polishing.</p>
        <p><strong>Attrition:</strong> Filling / Night Guard.</p>
        <p><strong>Crowns:</strong> If the crown is loose or broken, it's best to get it checked.</p>
      </div>
    </div>
  `;

  document.body.appendChild(reportElement);

  // 4. Use html2canvas to create an image of the report
  html2canvas(reportElement, {
    useCORS: true, // Important for fetching images from Cloudinary
    scale: 2 // Increase scale for better resolution
  }).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    
    // 5. Use jsPDF to create the PDF from the image
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const height = pdfWidth / ratio;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
    pdf.save(`oralvis-report-${submission._id}.pdf`);

    // 6. Clean up by removing the hidden element
    document.body.removeChild(reportElement);
  }).catch(err => {
    console.error("Error generating PDF:", err);
    alert("Could not generate PDF. Please ensure all images are accessible.");
    document.body.removeChild(reportElement);
  });
};