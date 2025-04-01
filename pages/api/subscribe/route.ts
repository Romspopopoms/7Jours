// app/api/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { firstName, email } = await request.json();
    
    // Validation
    if (!firstName || !email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Le prénom et l\'email sont requis' 
      }, { status: 400 });
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Format d\'email invalide' 
      }, { status: 400 });
    }
    
    // Vérifier si l'email existe déjà
    const existingUsers = await sql`
      SELECT * FROM subscribers WHERE email = ${email}
    `;
    
    if (existingUsers.rows.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cet email est déjà inscrit.'
      }, { status: 400 });
    }
    
    // Ajouter l'abonné
    const result = await sql`
      INSERT INTO subscribers (first_name, email)
      VALUES (${firstName}, ${email})
      RETURNING id
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Inscription réussie ! Vérifiez votre email pour recevoir votre PDF.',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'un abonné:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'inscription.' 
    }, { status: 500 });
  }
}