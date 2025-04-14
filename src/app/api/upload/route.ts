import { NextRequest, NextResponse } from 'next/server';
import { parseInventoryFile } from '@/lib/excel-parsers/inventory-parser';
import { parseCatalogFile } from '@/lib/excel-parsers/catalog-parser';
import { parseProjectFile } from '@/lib/excel-parsers/project-parser';
import { ImportFileType } from '@/lib/excel-parsers/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    // Get formData from the request
    const formData = await request.formData();
    const fileData = formData.get('file') as File | null;
    const fileType = formData.get('type') as ImportFileType | null;

    if (!fileData) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { error: 'File type not specified' },
        { status: 400 }
      );
    }

    // Process file based on type
    let result;
    switch (fileType) {
      case ImportFileType.INVENTORY:
        result = await parseInventoryFile(fileData);
        break;
      case ImportFileType.CATALOG:
        result = await parseCatalogFile(fileData);
        break;
      case ImportFileType.PROJECT:
        result = await parseProjectFile(fileData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
    }

    if (!result.success || !result.data) {
      return NextResponse.json(
        { 
          error: 'Failed to parse file', 
          details: result.errors 
        },
        { status: 400 }
      );
    }

    // Return processed data
    return NextResponse.json({
      type: fileType,
      items: result.data,
      // If it's a project, include the project metadata
      ...(fileType === ImportFileType.PROJECT && {
        projectName: result.data[0].projectName,
        clientName: result.data[0].clientName,
        totalCost: result.data[0].totalCost,
        totalSellingPrice: result.data[0].totalSellingPrice,
        totalProfit: result.data[0].totalProfit
      })
    });
  } catch (error) {
    console.error('Error processing file upload:', error);
    return NextResponse.json(
      { error: `Failed to process file: ${(error as Error).message}` },
      { status: 500 }
    );
  }
} 