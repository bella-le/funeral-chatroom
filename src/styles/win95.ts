// Windows 95/XP style components for reuse across the application

// Windows 95 color palette
export const win95Colors = {
  background: '#D4D0C8',  // Standard gray background
  windowsBlue: '#008080',  // Windows 95 teal/blue
  darkBlue: '#000080',    // Windows 95 dark blue
  titleBarBlue: '#0A246A', // Title bar blue
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#808080',
  lightGray: '#D3D3D3'
};

export const win95 = {
  // Container styles
  container: {
    maxWidth: '800px',
    margin: '20px auto',
    padding: '0',
    fontFamily: 'Tahoma, Arial, sans-serif',
    backgroundColor: '#D4D0C8',
    border: '2px solid #DFDFDF',
    borderTop: '2px solid #FFFFFF',
    borderLeft: '2px solid #FFFFFF',
    boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)'
  },
  
  // Title bar styles
  titleBar: {
    backgroundColor: '#0A246A',
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  titleText: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    margin: 0,
    fontFamily: 'Tahoma, Arial, sans-serif'
  },
  
  windowControls: {
    display: 'flex',
    gap: '2px'
  },
  
  windowButton: {
    width: '18px',
    height: '18px',
    backgroundColor: '#D4D0C8',
    border: '1px solid #FFFFFF',
    borderRight: '1px solid #404040',
    borderBottom: '1px solid #404040',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  
  // Content area styles
  contentArea: {
    padding: '10px'
  },
  
  // Panel styles
  panel: {
    backgroundColor: '#D4D0C8',
    border: '2px solid #DFDFDF',
    borderTop: '2px solid #FFFFFF',
    borderLeft: '2px solid #FFFFFF',
    padding: '10px'
  },
  
  // Form elements
  label: {
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: '11px',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '6px',
    color: '#000000'
  },
  
  input: {
    width: '100%',
    padding: '4px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #808080',
    borderTop: '1px solid #404040',
    borderLeft: '1px solid #404040',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: '11px'
  },
  
  button: {
    padding: '4px 8px',
    backgroundColor: '#D4D0C8',
    color: '#000000',
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: '11px',
    fontWeight: 'normal',
    border: '2px solid #DFDFDF',
    borderTop: '2px solid #FFFFFF',
    borderLeft: '2px solid #FFFFFF',
    cursor: 'pointer'
  },
  
  buttonDisabled: {
    cursor: 'wait',
    boxShadow: 'inset 1px 1px 1px #808080'
  },
  
  // Text styles
  text: {
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: '11px',
    color: '#000000'
  },
  
  textBold: {
    fontFamily: 'Tahoma, Arial, sans-serif',
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#000000'
  },
  
  // Error message
  errorMessage: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #FF0000',
    padding: '8px',
    marginBottom: '10px',
    fontSize: '11px',
    color: '#FF0000',
    fontFamily: 'Tahoma, Arial, sans-serif'
  },
  
  // Message display
  messageContainer: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #808080',
    borderTop: '1px solid #404040',
    borderLeft: '1px solid #404040',
    padding: '8px',
    marginBottom: '8px'
  },
  
  // Character display
  characterPreview: {
    height: '240px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #808080',
    borderTop: '1px solid #404040',
    borderLeft: '1px solid #404040',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  // Layout
  flexColumn: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  
  flexRow: {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: '10px'
  }
};
