package org.ecocollect.sj.core.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = ForestGreenPrimary,
    onPrimary = White,
    primaryContainer = MintBackground,
    onPrimaryContainer = ForestGreenDark,
    secondary = DeepNavy,
    onSecondary = White,
    secondaryContainer = Color(0xFFE2E8F0),
    onSecondaryContainer = DeepNavy,
    background = MintBackground,
    onBackground = SlateTextPrimary,
    surface = White,
    onSurface = SlateTextPrimary,
    surfaceVariant = SoftWhite,
    onSurfaceVariant = SlateTextSecondary,
    outline = CardBorder
)

private val DarkColorScheme = darkColorScheme(
    primary = ForestGreenLight,
    onPrimary = DeepNavy,
    primaryContainer = ForestGreenDark,
    onPrimaryContainer = MintBackground,
    secondary = Color(0xFF94A3B8),
    onSecondary = DeepNavy,
    background = Color(0xFF0F172A),
    onBackground = Color(0xFFF1F5F9),
    surface = Color(0xFF1E293B),
    onSurface = Color(0xFFF1F5F9),
    surfaceVariant = Color(0xFF334155),
    onSurfaceVariant = Color(0xFF94A3B8),
    outline = Color(0xFF475569)
)

@Composable
fun EcoCollectTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
