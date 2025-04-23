import { Note } from "@shared/schema";
import { jsPDF } from "jspdf";

// Helper to extract plain text from the note content
function extractTextFromContent(content: any): string {
  let text = '';
  
  try {
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }
    
    const extractTextFromNode = (node: any): void => {
      if (node.text) {
        text += node.text;
        
        // Add appropriate formatting for different marks
        if (node.marks?.some((mark: any) => mark.type === 'bold')) {
          text += ' ';
        }
      }
      
      if (node.content) {
        node.content.forEach(extractTextFromNode);
        
        // Add line breaks after block elements
        if (['paragraph', 'heading', 'bulletList', 'orderedList'].includes(node.type)) {
          text += '\n\n';
        }
      }
      
      // Add line breaks for list items
      if (node.type === 'listItem') {
        text += '\n';
      }
    };
    
    if (content.content) {
      content.content.forEach(extractTextFromNode);
    }
    
    // Clean up extra line breaks
    text = text.replace(/\n\n+/g, '\n\n').trim();
  } catch (error) {
    console.error('Error extracting text from note content:', error);
    text = 'Error parsing note content';
  }
  
  return text;
}

// Export note to PDF file
export function exportToPDF(note: Note): void {
  try {
    const doc = new jsPDF();
    const text = extractTextFromContent(note.content);
    
    // Add title
    doc.setFontSize(18);
    doc.text(note.title, 20, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 20, 30);
    doc.text(`Last updated: ${new Date(note.updatedAt).toLocaleDateString()}`, 20, 35);
    
    // Add content
    doc.setFontSize(12);
    
    // Split text into lines and add to PDF
    const lines = doc.splitTextToSize(text, 170);
    doc.text(lines, 20, 45);
    
    // Save PDF
    doc.save(`${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  } catch (error) {
    console.error('Error exporting note to PDF:', error);
    alert('Failed to export note to PDF. Please try again.');
  }
}

// Export note to plain text file
export function exportToText(note: Note): void {
  try {
    const text = extractTextFromContent(note.content);
    const fullText = `${note.title}\n\nCreated: ${new Date(note.createdAt).toLocaleDateString()}\nLast updated: ${new Date(note.updatedAt).toLocaleDateString()}\n\n${text}`;
    
    // Create blob and download link
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('Error exporting note to text:', error);
    alert('Failed to export note to text. Please try again.');
  }
}
